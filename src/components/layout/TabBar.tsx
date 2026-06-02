import { TAB_LABELS } from "../../constants";

interface TabBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  trashCount?: number;
}

const TABS = ["all", "drinking", "shelf", "fridge", "finished", "trash"];

export function TabBar({
  activeTab,
  onTabChange,
  trashCount = 0,
}: TabBarProps) {
  return (
    <div className="flex gap-1 overflow-x-auto scrollbar-hide px-4 py-2 -mx-1">
      {TABS.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`flex-shrink-0 px-2.5 py-1.5 text-sm rounded-lg transition-all
            active:scale-[0.97] whitespace-nowrap
            ${
              activeTab === tab
                ? "bg-surface-cream text-ink font-medium"
                : "text-ink-muted hover:bg-surface-card"
            }`}
        >
          {TAB_LABELS[tab]}
          {tab === "trash" && trashCount > 0 && (
            <span className="ml-1 text-xs text-ink-soft">({trashCount})</span>
          )}
        </button>
      ))}
    </div>
  );
}
