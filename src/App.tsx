import { BrowserRouter, Routes, Route } from 'react-router-dom';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ToastProvider, useToast } from './components/ui/Toast';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { HomePage } from './pages/HomePage';
import { AddBeanPage } from './pages/AddBeanPage';
import { BeanDetailPage } from './pages/BeanDetailPage';
import { BeanCalendarPage } from './pages/BeanCalendarPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSyncOnStartup } from './hooks/useSync';
import { useBeanStore } from './store/beanStore';
import type { MergeStrategy } from './types/bean';

function AppShell() {
  useSyncOnStartup();
  const { pendingMerge, resolveMerge } = useBeanStore();
  const { showToast } = useToast();

  const handleMergeResolve = async (strategy: MergeStrategy) => {
    try {
      await resolveMerge(strategy);
      const labels: Record<MergeStrategy, string> = {
        local: '已使用本地数据',
        remote: '已使用云端数据',
        merge: '数据已合并',
      };
      showToast(labels[strategy]);
    } catch {
      showToast('同步失败，请重试', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddBeanPage />} />
        <Route path="/bean/:id" element={<BeanDetailPage />} />
        <Route path="/calendar" element={<BeanCalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <BottomNav />

      {/* Merge confirmation dialog — global, shown on any page */}
      <AlertDialog.Root open={pendingMerge !== null} onOpenChange={() => {}}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-[fadeIn_0.15s_ease-out]" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
            bg-canvas rounded-xl shadow-lg p-6 w-[calc(100vw-2rem)] max-w-sm
            animate-[toast-in_0.2s_ease-out]">
            <AlertDialog.Title className="text-lg font-semibold text-ink mb-2">
              同步冲突
            </AlertDialog.Title>
            <AlertDialog.Description className="text-sm text-ink-body leading-relaxed mb-6">
              本地和云端都有数据，请选择同步方式：
              {pendingMerge && (
                <div className="mt-3 space-y-1 text-ink-muted">
                  <div>
                    本地: {pendingMerge.localTotal} 个豆子
                    {pendingMerge.localDeleted > 0 && `（${pendingMerge.localDeleted} 个在回收站）`}
                  </div>
                  <div>
                    云端: {pendingMerge.remoteTotal} 个豆子
                    {pendingMerge.remoteDeleted > 0 && `（${pendingMerge.remoteDeleted} 个在回收站）`}
                  </div>
                </div>
              )}
            </AlertDialog.Description>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleMergeResolve('local')}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium
                  hover:bg-primary-active active:scale-[0.98] transition-all"
              >
                使用本地数据
              </button>
              <button
                onClick={() => handleMergeResolve('remote')}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium
                  hover:bg-primary-active active:scale-[0.98] transition-all"
              >
                使用云端数据
              </button>
              <button
                onClick={() => handleMergeResolve('merge')}
                className="w-full py-2.5 bg-surface-card text-ink rounded-lg text-sm font-medium
                  hover:bg-surface-cream active:scale-[0.98] transition-all border border-hairline"
              >
                合并数据
              </button>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </BrowserRouter>
  );
}