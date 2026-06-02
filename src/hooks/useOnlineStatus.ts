import { useState, useEffect } from 'react';
import { useBeanStore } from '../store/beanStore';

export function useOnlineStatus() {
  const setOnline = useBeanStore((s) => s.setOnline);
  const isOnline = useBeanStore((s) => s.isOnline);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return isOnline;
}