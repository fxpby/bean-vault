import { useState, useEffect } from 'react';
import { useBeanStore } from '../store/beanStore';
import { useWishlistStore } from '../store/wishlistStore';

export function useOnlineStatus() {
  const setOnline = useBeanStore((s) => s.setOnline);
  const setWishlistOnline = useWishlistStore((s) => s.setOnline);
  const isOnline = useBeanStore((s) => s.isOnline);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      setWishlistOnline(true);
    };
    const handleOffline = () => {
      setOnline(false);
      setWishlistOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline, setWishlistOnline]);

  return isOnline;
}
