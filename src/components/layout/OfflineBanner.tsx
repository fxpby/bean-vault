import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="sticky top-0 z-30 bg-warning-soft text-warning text-center text-xs font-medium py-1.5 px-4 safe-top">
      当前离线，数据仅保存在本地
    </div>
  );
}