import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { Bean, BeanFormData, BeanStatus, SortMode, SyncQueueItem, MergeInfo, MergeStrategy } from '../types/bean';
import { todayString } from '../utils/resting';
import {
  createRemoteBean,
  updateRemoteBean,
  deleteRemoteBean,
  permanentlyDeleteRemoteBean,
  fetchRemoteBeans,
  isLoggedIn,
} from '../supabase/sync';

interface BeanStore {
  beans: Bean[];
  sortMode: SortMode;
  syncQueue: SyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;
  pendingMerge: MergeInfo | null;

  addBean: (data: BeanFormData) => Bean;
  updateBean: (id: string, data: Partial<BeanFormData>) => void;
  deleteBean: (id: string) => void;
  restoreBean: (id: string) => void;
  permanentlyDeleteBean: (id: string) => void;
  setBeanStatus: (id: string, status: BeanStatus) => void;
  setSortMode: (mode: SortMode) => void;
  setOnline: (online: boolean) => void;

  // Remote sync
  syncFromRemote: () => Promise<void>;
  resolveMerge: (strategy: MergeStrategy) => Promise<void>;
  setBeans: (beans: Bean[]) => void;

  exportBeans: () => string;
  importBeans: (data: Bean[], strategy: 'merge' | 'replace') => void;

  addToSyncQueue: (item: SyncQueueItem) => void;
  removeFromSyncQueue: (id: string) => void;
  clearSyncQueue: () => void;
}

const localforageStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const val = await localforage.getItem(name);
    if (val === null || val === undefined) return null;
    return JSON.stringify(val);
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await localforage.setItem(name, JSON.parse(value));
  },
  removeItem: async (name: string): Promise<void> => {
    await localforage.removeItem(name);
  },
};

/**
 * Detects if there's a data conflict between local and remote beans.
 * Returns true if:
 * - ID sets differ (different size or different IDs)
 * - Any bean with the same ID has different updatedAt
 * Returns false only when all IDs match and all updatedAt values match.
 */
function hasDataConflict(localBeans: Bean[], remoteBeans: Bean[]): boolean {
  // Build maps: id -> updatedAt
  const localMap = new Map(localBeans.map((b) => [b.id, b.updatedAt]));
  const remoteMap = new Map(remoteBeans.map((b) => [b.id, b.updatedAt]));

  // Check if ID sets differ
  if (localMap.size !== remoteMap.size) {
    return true;
  }

  // Check if any bean with the same ID has different updatedAt
  // (Size equality guarantees that if all local IDs exist in remote, then they're identical sets)
  for (const [id, localUpdatedAt] of localMap.entries()) {
    const remoteUpdatedAt = remoteMap.get(id);
    // If remote doesn't have this ID, or updatedAt differs, it's a conflict
    if (remoteUpdatedAt === undefined || remoteUpdatedAt !== localUpdatedAt) {
      return true;
    }
  }

  // All checks passed — no conflict
  return false;
}

export const useBeanStore = create<BeanStore>()(
  persist(
    (set, get) => ({
      beans: [],
      sortMode: 'default',
      syncQueue: [],
      isOnline: true,
      isSyncing: false,
      pendingMerge: null,

      addBean: (data: BeanFormData) => {
        const now = new Date().toISOString();
        const bean: Bean = {
          id: uuidv4(),
          name: data.name,
          category: data.category,
          status: data.status,
          country: data.country,
          countryCode: data.countryCode || undefined,
          estate: data.estate,
          variety: data.variety,
          process: data.process,
          roastLevel: data.roastLevel,
          flavorNotes: data.flavorNotes,
          pricePerGram: data.pricePerGram,
          restingDays: data.restingDays,
          productionDate: data.productionDate || todayString(),
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ beans: [bean, ...state.beans] }));

        // Fire async: push to Supabase
        syncToRemote('create', bean);

        return bean;
      },

      updateBean: (id: string, data: Partial<BeanFormData>) => {
        let updated: Bean | undefined;
        set((state) => ({
          beans: state.beans.map((b) => {
            if (b.id === id) {
              updated = { ...b, ...data, updatedAt: new Date().toISOString() };
              return updated;
            }
            return b;
          }),
        }));
        if (updated) syncToRemote('update', updated);
      },

      deleteBean: (id: string) => {
        let deleted: Bean | undefined;
        set((state) => ({
          beans: state.beans.map((b) => {
            if (b.id === id) {
              deleted = { ...b, isDeleted: true, updatedAt: new Date().toISOString() };
              return deleted;
            }
            return b;
          }),
        }));
        if (deleted) syncToRemote('delete', deleted);
      },

      restoreBean: (id: string) => {
        let restored: Bean | undefined;
        set((state) => ({
          beans: state.beans.map((b) => {
            if (b.id === id) {
              restored = { ...b, isDeleted: false, updatedAt: new Date().toISOString() };
              return restored;
            }
            return b;
          }),
        }));
        if (restored) syncToRemote('update', restored);
      },

      permanentlyDeleteBean: (id: string) => {
        set((state) => ({
          beans: state.beans.filter((b) => b.id !== id),
        }));
        permanentlyDeleteRemoteBean(id); // fire-and-forget
      },

      setBeanStatus: (id: string, status: BeanStatus) => {
        let updated: Bean | undefined;
        set((state) => ({
          beans: state.beans.map((b) => {
            if (b.id === id) {
              updated = { ...b, status, updatedAt: new Date().toISOString() };
              return updated;
            }
            return b;
          }),
        }));
        if (updated) syncToRemote('update', updated);
      },

      setSortMode: (mode: SortMode) => {
        set({ sortMode: mode });
      },

      setOnline: (online: boolean) => {
        set({ isOnline: online });
        // Retry sync queue when coming back online
        if (online) {
          processSyncQueue();
        }
      },

      syncFromRemote: async () => {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) return;

        set({ isSyncing: true });
        try {
          const remoteBeans = await fetchRemoteBeans();
          if (remoteBeans.length === 0) {
            // Push all local beans to remote (first-time sync)
            const { beans } = get();
            for (const bean of beans) {
              await (bean.isDeleted
                ? deleteRemoteBean(bean.id)
                : bean.createdAt === bean.updatedAt
                  ? createRemoteBean(bean)
                  : updateRemoteBean(bean));
            }
          } else {
            const localBeans = get().beans;

            // Local is empty: first-time sync FROM cloud — just import remote data
            if (localBeans.length === 0) {
              set({ beans: remoteBeans });
            } else if (get().pendingMerge) {
              // Already has a pending merge dialog open — skip auto-merge
            } else {
              // Both local and remote have data — check if there's an actual conflict
              const hasConflict = hasDataConflict(localBeans, remoteBeans);
              if (hasConflict) {
                // Set pending merge for user resolution
                set({
                  pendingMerge: {
                    localTotal: localBeans.length,
                    localDeleted: localBeans.filter((b) => b.isDeleted).length,
                    remoteTotal: remoteBeans.length,
                    remoteDeleted: remoteBeans.filter((b) => b.isDeleted).length,
                    remoteBeans,
                  },
                });
              }
              // If no conflict, data is already in sync — do nothing
            }
          }
        } catch (err) {
          console.error('[sync] syncFromRemote error:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      setBeans: (beans: Bean[]) => {
        set({ beans });
      },

      resolveMerge: async (strategy: MergeStrategy) => {
        const { pendingMerge } = get();
        if (!pendingMerge) return;

        const { remoteBeans } = pendingMerge;
        const localBeans = get().beans;

        try {
          if (strategy === 'local') {
            // Keep local beans, push all to remote (overwrite cloud)
            for (const bean of localBeans) {
              await (bean.isDeleted
                ? deleteRemoteBean(bean.id)
                : bean.createdAt === bean.updatedAt
                  ? createRemoteBean(bean)
                  : updateRemoteBean(bean));
            }
          } else if (strategy === 'remote') {
            // Use remote beans, replace local
            set({ beans: remoteBeans });
          } else if (strategy === 'merge') {
            // Last-write-wins merge
            const remoteMap = new Map(remoteBeans.map((b) => [b.id, b]));
            const localMap = new Map(localBeans.map((b) => [b.id, b]));
            const merged: Bean[] = [];
            const allIds = new Set([...remoteMap.keys(), ...localMap.keys()]);

            for (const id of allIds) {
              const local = localMap.get(id);
              const remote = remoteMap.get(id);
              if (local && remote) {
                merged.push(new Date(local.updatedAt) >= new Date(remote.updatedAt) ? local : remote);
              } else if (local && !remote) {
                merged.push(local);
                await (local.isDeleted ? deleteRemoteBean(local.id) : createRemoteBean(local));
              } else if (remote && !local) {
                merged.push(remote);
              }
            }
            set({ beans: merged });
          }

          set({ pendingMerge: null });
        } catch (err) {
          console.error('[sync] resolveMerge error:', err);
          throw err;
        }
      },

      exportBeans: () => {
        const { beans } = get();
        const exportData = {
          version: 1,
          beans: beans.filter((b) => !b.isDeleted),
          exportedAt: new Date().toISOString(),
        };
        return JSON.stringify(exportData, null, 2);
      },

      importBeans: (data: Bean[], strategy: 'merge' | 'replace') => {
        if (strategy === 'replace') {
          set({ beans: data });
          // Push all to remote
          data.forEach((b) => syncToRemote('create', b));
        } else {
          set((state) => {
            const existingIds = new Set(state.beans.map((b) => b.id));
            const merged = [...state.beans];
            for (const bean of data) {
              const exists = existingIds.has(bean.id);
              if (exists) {
                const idx = merged.findIndex((b) => b.id === bean.id);
                if (idx !== -1) {
                  merged[idx] = { ...bean, updatedAt: new Date().toISOString() };
                }
              } else {
                merged.push(bean);
              }
              syncToRemote(exists ? 'update' : 'create', bean);
            }
            return { beans: merged };
          });
        }
      },

      addToSyncQueue: (item: SyncQueueItem) => {
        set((state) => ({ syncQueue: [...state.syncQueue, item] }));
      },

      removeFromSyncQueue: (id: string) => {
        set((state) => ({
          syncQueue: state.syncQueue.filter((item) => item.id !== id),
        }));
      },

      clearSyncQueue: () => {
        set({ syncQueue: [] });
      },
    }),
    {
      name: 'bean-vault-store',
      storage: createJSONStorage(() => localforageStorage),
      partialize: (state) => ({
        beans: state.beans,
        sortMode: state.sortMode,
      }),
    }
  )
);

// -- Internal sync helpers (fire-and-forget from store actions) --

async function syncToRemote(action: 'create' | 'update' | 'delete', bean: Bean): Promise<void> {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) return;

  const online = useBeanStore.getState().isOnline;
  if (!online) {
    // Queue for later
    useBeanStore.getState().addToSyncQueue({
      id: `${action}-${bean.id}-${Date.now()}`,
      action,
      beanId: bean.id,
      data: bean,
      timestamp: Date.now(),
    });
    return;
  }

  try {
    switch (action) {
      case 'create':
        await createRemoteBean(bean);
        break;
      case 'update':
        await updateRemoteBean(bean);
        break;
      case 'delete':
        await deleteRemoteBean(bean.id);
        break;
    }
  } catch (err) {
    console.error(`[sync] syncToRemote ${action} error:`, err);
    // Queue failed sync for retry
    useBeanStore.getState().addToSyncQueue({
      id: `${action}-${bean.id}-${Date.now()}`,
      action,
      beanId: bean.id,
      data: bean,
      timestamp: Date.now(),
    });
  }
}

async function processSyncQueue(): Promise<void> {
  const queue = useBeanStore.getState().syncQueue;
  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      switch (item.action) {
        case 'create':
          if (item.data) await createRemoteBean(item.data as Bean);
          break;
        case 'update':
          if (item.data) await updateRemoteBean(item.data as Bean);
          break;
        case 'delete':
          await deleteRemoteBean(item.beanId);
          break;
      }
      useBeanStore.getState().removeFromSyncQueue(item.id);
    } catch {
      // Will retry next time
      break;
    }
  }
}