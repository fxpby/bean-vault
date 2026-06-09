import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { v4 as uuidv4 } from 'uuid';
import type { WishlistFormData, WishlistItem, WishlistSyncQueueItem } from '../types/bean';
import { isLoggedIn } from '../supabase/sync';
import {
  createRemoteWishlistItem,
  deleteRemoteWishlistItem,
  fetchRemoteWishlistItems,
  updateRemoteWishlistItem,
} from '../supabase/wishlistSync';

interface WishlistStore {
  items: WishlistItem[];
  syncQueue: WishlistSyncQueueItem[];
  isOnline: boolean;
  isSyncing: boolean;

  addItem: (data: WishlistFormData) => WishlistItem;
  updateItem: (id: string, data: Partial<WishlistFormData>) => void;
  deleteItem: (id: string) => void;
  setOnline: (online: boolean) => void;
  syncFromRemote: () => Promise<void>;
  addToSyncQueue: (item: WishlistSyncQueueItem) => void;
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

function mergeWishlistItems(localItems: WishlistItem[], remoteItems: WishlistItem[]): WishlistItem[] {
  const localMap = new Map(localItems.map((item) => [item.id, item]));
  const remoteMap = new Map(remoteItems.map((item) => [item.id, item]));
  const merged: WishlistItem[] = [];
  const allIds = new Set([...localMap.keys(), ...remoteMap.keys()]);

  for (const id of allIds) {
    const local = localMap.get(id);
    const remote = remoteMap.get(id);
    if (local && remote) {
      merged.push(new Date(local.updatedAt) >= new Date(remote.updatedAt) ? local : remote);
    } else if (local) {
      merged.push(local);
    } else if (remote) {
      merged.push(remote);
    }
  }

  return merged.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      syncQueue: [],
      isOnline: true,
      isSyncing: false,

      addItem: (data: WishlistFormData) => {
        const now = new Date().toISOString();
        const item: WishlistItem = {
          id: uuidv4(),
          name: data.name,
          roaster: data.roaster,
          country: data.country,
          countryCode: data.countryCode,
          estate: data.estate,
          variety: data.variety,
          process: data.process,
          roastLevel: data.roastLevel,
          flavorNotes: data.flavorNotes,
          price: data.price,
          purchaseUrl: data.purchaseUrl,
          reason: data.reason,
          priority: data.priority,
          isDeleted: false,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({ items: [item, ...state.items] }));
        syncToRemote('create', item);
        return item;
      },

      updateItem: (id: string, data: Partial<WishlistFormData>) => {
        let updated: WishlistItem | undefined;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              updated = { ...item, ...data, updatedAt: new Date().toISOString() };
              return updated;
            }
            return item;
          }),
        }));
        if (updated) syncToRemote('update', updated);
      },

      deleteItem: (id: string) => {
        let deleted: WishlistItem | undefined;
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id === id) {
              deleted = { ...item, isDeleted: true, updatedAt: new Date().toISOString() };
              return deleted;
            }
            return item;
          }),
        }));
        if (deleted) syncToRemote('delete', deleted);
      },

      setOnline: (online: boolean) => {
        set({ isOnline: online });
        if (online) {
          processSyncQueue();
        }
      },

      syncFromRemote: async () => {
        const loggedIn = await isLoggedIn();
        if (!loggedIn) return;

        set({ isSyncing: true });
        try {
          const remoteItems = await fetchRemoteWishlistItems();
          const localItems = get().items;

          if (remoteItems.length === 0) {
            for (const item of localItems.filter((entry) => !entry.isDeleted)) {
              await createRemoteWishlistItem(item);
            }
          } else if (localItems.length === 0) {
            set({ items: remoteItems });
          } else {
            const merged = mergeWishlistItems(localItems, remoteItems);
            set({ items: merged });

            const remoteMap = new Map(remoteItems.map((item) => [item.id, item]));
            for (const item of localItems) {
              const remote = remoteMap.get(item.id);
              if (!remote && !item.isDeleted) {
                await createRemoteWishlistItem(item);
              } else if (remote && new Date(item.updatedAt) > new Date(remote.updatedAt)) {
                await (item.isDeleted ? deleteRemoteWishlistItem(item.id) : updateRemoteWishlistItem(item));
              }
            }
          }
        } catch (err) {
          console.error('[wishlist-sync] syncFromRemote error:', err);
        } finally {
          set({ isSyncing: false });
        }
      },

      addToSyncQueue: (item: WishlistSyncQueueItem) => {
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
      name: 'bean-vault-wishlist-store',
      storage: createJSONStorage(() => localforageStorage),
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);

async function syncToRemote(action: 'create' | 'update' | 'delete', item: WishlistItem): Promise<void> {
  const loggedIn = await isLoggedIn();
  if (!loggedIn) return;

  const online = useWishlistStore.getState().isOnline;
  if (!online) {
    useWishlistStore.getState().addToSyncQueue({
      id: `${action}-${item.id}-${Date.now()}`,
      action,
      itemId: item.id,
      data: item,
      timestamp: Date.now(),
    });
    return;
  }

  try {
    switch (action) {
      case 'create':
        await createRemoteWishlistItem(item);
        break;
      case 'update':
        await updateRemoteWishlistItem(item);
        break;
      case 'delete':
        await deleteRemoteWishlistItem(item.id);
        break;
    }
  } catch (err) {
    console.error(`[wishlist-sync] syncToRemote ${action} error:`, err);
    useWishlistStore.getState().addToSyncQueue({
      id: `${action}-${item.id}-${Date.now()}`,
      action,
      itemId: item.id,
      data: item,
      timestamp: Date.now(),
    });
  }
}

async function processSyncQueue(): Promise<void> {
  const queue = useWishlistStore.getState().syncQueue;
  if (queue.length === 0) return;

  for (const item of queue) {
    try {
      switch (item.action) {
        case 'create':
          if (item.data) await createRemoteWishlistItem(item.data as WishlistItem);
          break;
        case 'update':
          if (item.data) await updateRemoteWishlistItem(item.data as WishlistItem);
          break;
        case 'delete':
          await deleteRemoteWishlistItem(item.itemId);
          break;
      }
      useWishlistStore.getState().removeFromSyncQueue(item.id);
    } catch {
      break;
    }
  }
}
