import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { BottomNav } from './components/layout/BottomNav';
import { OfflineBanner } from './components/layout/OfflineBanner';
import { HomePage } from './pages/HomePage';
import { AddBeanPage } from './pages/AddBeanPage';
import { BeanDetailPage } from './pages/BeanDetailPage';
import { SettingsPage } from './pages/SettingsPage';
import { useSyncOnStartup } from './hooks/useSync';

function AppShell() {
  useSyncOnStartup();

  return (
    <div className="min-h-screen bg-canvas">
      <OfflineBanner />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddBeanPage />} />
        <Route path="/bean/:id" element={<BeanDetailPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <BottomNav />
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