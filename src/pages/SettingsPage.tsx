import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBeanStore } from '../store/beanStore';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { Bean, ImportData } from '../types/bean';
import { signIn, signUp, signOut, getSession } from '../supabase/client';

export function SettingsPage() {
  const navigate = useNavigate();
  const { beans, exportBeans, importBeans } = useBeanStore();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<Bean[]>([]);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthPanel, setShowAuthPanel] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);

  const activeBeans = beans.filter((b) => !b.isDeleted);
  const trashBeans = beans.filter((b) => b.isDeleted);

  const handleExport = () => {
    const json = exportBeans();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `beanvault-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('导出成功');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data: ImportData = JSON.parse(text);
        if (!data.beans || !Array.isArray(data.beans)) {
          showToast('文件格式无效', 'error');
          return;
        }
        setImportData(data.beans);
        setShowImportDialog(true);
      } catch {
        showToast('JSON 解析失败', 'error');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImport = (strategy: 'merge' | 'replace') => {
    importBeans(importData, strategy);
    setShowImportDialog(false);
    showToast(`导入成功 (${strategy === 'merge' ? '合并' : '替换'} ${importData.length} 条记录)`);
  };

  const handleAuth = async () => {
    if (!authEmail.trim()) {
      showToast('请输入邮箱', 'error');
      return;
    }
    if (!authPassword.trim() || authPassword.length < 6) {
      showToast('密码至少 6 位', 'error');
      return;
    }

    if (isSignUp) {
      const { success, needConfirm, error } = await signUp(authEmail, authPassword);
      if (success && needConfirm) {
        showToast('注册成功，请检查邮箱确认后登录', 'info');
        setShowAuthPanel(false);
        setIsSignUp(false);
      } else if (success) {
        showToast('注册成功，已自动登录');
        setIsLoggedIn(true);
        setShowAuthPanel(false);
      } else {
        showToast(error || '注册失败', 'error');
      }
    } else {
      const { success, error } = await signIn(authEmail, authPassword);
      if (success) {
        setIsLoggedIn(true);
        showToast('登录成功');
        setShowAuthPanel(false);
      } else {
        showToast(error || '登录失败，账号不存在？请先注册', 'error');
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
    showToast('已退出登录');
  };

  // Check session on mount
  useState(() => {
    getSession().then(({ data }) => {
      if (data.session) setIsLoggedIn(true);
    });
  });

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="px-4 h-14 flex items-center">
          <h1 className="text-lg font-bold text-ink">设置</h1>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-card rounded-xl p-4">
            <div className="text-2xl font-bold text-primary">{activeBeans.length}</div>
            <div className="text-xs text-ink-muted mt-1">活跃豆子</div>
          </div>
          <div className="bg-surface-card rounded-xl p-4">
            <div className="text-2xl font-bold text-ink-muted">{trashBeans.length}</div>
            <div className="text-xs text-ink-muted mt-1">回收站</div>
          </div>
        </div>

        {/* Data management */}
        <div className="bg-canvas rounded-xl border border-hairline overflow-hidden">
          <SectionTitle>数据管理</SectionTitle>

          <SettingsRow
            icon={<ExportIcon />}
            label="导出数据"
            description="导出所有豆子为 JSON 文件"
            onClick={handleExport}
          />
          <SettingsRow
            icon={<ImportIcon />}
            label="导入数据"
            description="从 JSON 文件导入豆子"
            onClick={() => fileInputRef.current?.click()}
          />
          <SettingsRow
            icon={<TrashIcon />}
            label="回收站"
            description={`${trashBeans.length} 个已删除的豆子`}
            onClick={() => navigate('/')}
          />
        </div>

        {/* Cloud sync */}
        <div className="bg-canvas rounded-xl border border-hairline overflow-hidden">
          <SectionTitle>云同步</SectionTitle>

          {isLoggedIn ? (
            <SettingsRow
              icon={<CloudIcon />}
              label="已登录"
              description={authEmail || '已连接云端同步'}
              onClick={handleLogout}
              actionLabel="退出"
            />
          ) : (
            <>
              <SettingsRow
                icon={<CloudIcon />}
                label={isSignUp ? '注册' : '登录'}
                description="注册账号以同步数据到云端"
                onClick={() => setShowAuthPanel(!showAuthPanel)}
              />
              {showAuthPanel && (
                <div className="px-4 pb-4 space-y-3">
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="邮箱地址"
                    className="form-input"
                  />
                  <input
                    type="password"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="密码（至少 6 位）"
                    className="form-input"
                  />
                  <button
                    onClick={handleAuth}
                    className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-medium
                      hover:bg-primary-active active:scale-[0.98] transition-all"
                  >
                    {isSignUp ? '注册' : '登录'}
                  </button>
                  <button
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="w-full py-2 text-xs text-ink-muted hover:text-primary transition-colors"
                  >
                    {isSignUp ? '已有账号？去登录' : '没有账号？去注册'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* About */}
        <div className="bg-canvas rounded-xl border border-hairline overflow-hidden">
          <SectionTitle>关于</SectionTitle>
          <div className="px-4 pb-4">
            <p className="text-sm text-ink-muted leading-relaxed">
              BeanVault 豆仓 v0.1.0<br />
              咖啡豆库存管理工具，养豆期自动计算。<br />
              数据存储在本地，支持云端同步。
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <ConfirmDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        title="导入数据"
        description={`检测到 ${importData.length} 条豆子记录。请选择导入方式：`}
        confirmLabel="合并"
        cancelLabel="替换"
        onConfirm={() => handleImport('merge')}
      />
    </div>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="px-4 pt-4 pb-2 text-xs font-semibold text-ink-soft uppercase tracking-wider">
      {children}
    </h3>
  );
}

function SettingsRow({ icon, label, description, onClick, actionLabel }: {
  icon: React.ReactNode;
  label: string;
  description: string;
  onClick: () => void;
  actionLabel?: string;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 text-left
        hover:bg-surface-card active:bg-surface-cream transition-colors"
    >
      <span className="text-ink-muted flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink">{label}</div>
        <div className="text-xs text-ink-muted mt-0.5">{description}</div>
      </div>
      {actionLabel ? (
        <span className="text-xs text-primary font-medium flex-shrink-0">{actionLabel}</span>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" className="text-ink-soft flex-shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </button>
  );
}

function ExportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ImportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

function CloudIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
    </svg>
  );
}