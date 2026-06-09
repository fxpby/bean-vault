import { useNavigate } from 'react-router-dom';
import type { WishlistItem } from '../../types/bean';
import {
  PROCESS_LABELS,
  ROAST_LABELS,
  WISHLIST_PRIORITY_LABELS,
} from '../../constants';
import { getCountryFlag } from '../../utils/wishlist';
import { useToast } from '../ui/Toast';

interface WishlistCardProps {
  item: WishlistItem;
}

export function WishlistCard({ item }: WishlistCardProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const flag = getCountryFlag(item.countryCode);

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard
      .writeText(item.purchaseUrl)
      .then(() => showToast('链接已复制'))
      .catch(() => showToast('复制失败，请手动复制', 'error'));
  };

  const handleAddToVault = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/add?fromWishlist=${item.id}`);
  };

  const priorityClass = item.priority === 'must'
    ? 'bg-error-soft text-error'
    : item.priority === 'high'
      ? 'bg-primary-soft text-primary'
      : 'bg-surface-card text-ink-muted';
  const originText = [
    item.country,
    item.estate,
    item.variety,
  ].filter(Boolean).join(' · ');

  return (
    <div
      onClick={() => navigate(`/wishlist/${item.id}`)}
      className="bg-canvas rounded-xl p-4 border border-hairline
        hover:border-hairline-soft hover:shadow-sm active:scale-[0.99]
        transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-ink truncate">{item.name}</h3>
            {flag && <span className="text-base flex-shrink-0">{flag}</span>}
          </div>
          {item.roaster && (
            <p className="text-xs text-ink-muted mt-0.5 truncate">{item.roaster}</p>
          )}
          <p className="text-xs text-ink-soft mt-0.5 truncate">{originText}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${priorityClass}`}>
          {WISHLIST_PRIORITY_LABELS[item.priority]}
        </span>
      </div>

      {(item.process || item.roastLevel) && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {item.process && (
            <InfoChip label="处理" value={PROCESS_LABELS[item.process]} />
          )}
          {item.roastLevel && (
            <InfoChip label="烘焙" value={ROAST_LABELS[item.roastLevel]} />
          )}
        </div>
      )}

      {item.flavorNotes.length > 0 && (
        <div className="flex items-start gap-1.5 mb-2.5">
          <span className="text-xs text-ink-soft flex-shrink-0 pt-0.5">风味</span>
          <div className="flex flex-wrap gap-1 min-w-0">
            {item.flavorNotes.slice(0, 3).map((note) => (
              <span key={note} className="text-xs px-2 py-0.5 rounded-full bg-primary-soft text-primary">
                {note}
              </span>
            ))}
            {item.flavorNotes.length > 3 && (
              <span className="text-xs text-ink-soft pt-0.5">+{item.flavorNotes.length - 3}</span>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-2 pt-2 border-t border-hairline-soft">
        <div className="min-w-0 flex-1">
          {item.price && (
            <p className="text-xs text-ink-muted truncate">价格：{item.price}</p>
          )}
        </div>
        <div className="flex items-center justify-end gap-1 flex-shrink-0">
          {item.purchaseUrl.trim() && (
            <button
              onClick={handleCopyLink}
              className="w-8 h-8 rounded-lg bg-surface-card text-ink-muted flex items-center justify-center
                hover:bg-surface-cream active:scale-[0.97] transition-all"
              aria-label="复制购买链接"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          )}
          <button
            onClick={handleAddToVault}
            className="px-2.5 py-1.5 text-xs font-medium bg-primary text-white rounded-lg
              hover:bg-primary-active active:scale-[0.97] transition-all"
          >
            加入豆仓
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoChip({ label, value }: {
  label: string;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface-card text-xs">
      <span className="text-ink-soft">{label}</span>
      <span className="text-ink-muted font-medium">{value}</span>
    </span>
  );
}
