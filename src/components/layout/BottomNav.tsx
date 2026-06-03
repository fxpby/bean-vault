import { useNavigate, useLocation } from 'react-router-dom';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';
  const isCalendar = location.pathname === '/calendar';
  const isSettings = location.pathname === '/settings';

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-canvas/95 backdrop-blur-sm
      border-t border-hairline safe-bottom">
      <div className="flex items-center justify-around h-14 max-w-lg mx-auto">
        <button
          onClick={() => navigate('/')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full
            active:scale-[0.97] transition-all ${isHome ? 'text-primary' : 'text-ink-soft'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={isHome ? 2 : 1.5} strokeLinecap="round">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
            <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
            <line x1="6" y1="1" x2="6" y2="4" />
            <line x1="10" y1="1" x2="10" y2="4" />
            <line x1="14" y1="1" x2="14" y2="4" />
          </svg>
          <span className="text-[10px] font-medium">豆仓</span>
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full
            active:scale-[0.97] transition-all ${isCalendar ? 'text-primary' : 'text-ink-soft'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={isCalendar ? 2 : 1.5} strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-[10px] font-medium">豆历</span>
        </button>

        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center justify-center gap-0.5 w-full h-full
            active:scale-[0.97] transition-all ${isSettings ? 'text-primary' : 'text-ink-soft'}`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth={isSettings ? 2 : 1.5} strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span className="text-[10px] font-medium">设置</span>
        </button>
      </div>
    </nav>
  );
}