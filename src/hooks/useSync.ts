import { useEffect, useRef } from 'react';
import { useBeanStore } from '../store/beanStore';
import { isLoggedIn } from '../supabase/sync';
import { onAuthStateChange } from '../supabase/client';

export function useSyncOnStartup() {
  const syncFromRemote = useBeanStore((s) => s.syncFromRemote);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (hasSynced.current) return;
    hasSynced.current = true;

    // Try initial sync
    isLoggedIn().then((loggedIn: boolean) => {
      if (loggedIn) {
        syncFromRemote();
      }
    });

    // Listen for auth changes to sync after login
    const { data } = onAuthStateChange((session: unknown) => {
      if (session) {
        syncFromRemote();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, [syncFromRemote]);
}