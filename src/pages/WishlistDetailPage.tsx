import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { WishlistFormFields } from '../components/wishlist/WishlistFormFields';
import {
  PROCESS_LABELS,
  ROAST_LABELS,
  WISHLIST_PRIORITY_LABELS,
} from '../constants';
import { useWishlistStore } from '../store/wishlistStore';
import type { WishlistFormData } from '../types/bean';
import { getCountryFlag, wishlistItemToFormData } from '../utils/wishlist';

export function WishlistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const items = useWishlistStore((s) => s.items);
  const updateItem = useWishlistStore((s) => s.updateItem);
  const deleteItem = useWishlistStore((s) => s.deleteItem);
  const { showToast } = useToast();

  const item = items.find((entry) => entry.id === id && !entry.isDeleted);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<WishlistFormData | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!item) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">豆愿不存在或已被删除</p>
          <button
            onClick={() => navigate('/wishlist')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm
              hover:bg-primary-active active:scale-[0.97] transition-all"
          >
            返回豆愿
          </button>
        </div>
      </div>
    );
  }

  const form = editForm ?? wishlistItemToFormData(item);
  const flag = getCountryFlag(item.countryCode);

  const updateField = <K extends keyof WishlistFormData>(key: K, value: WishlistFormData[K]) => {
    setEditForm((prev) => ({ ...(prev ?? wishlistItemToFormData(item)), [key]: value }));
  };

  const handleEdit = () => {
    setEditForm(wishlistItemToFormData(item));
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      showToast('请输入豆子名称', 'error');
      return;
    }
    if (!form.country.trim() || !form.countryCode.trim()) {
      showToast('请选择产国', 'error');
      return;
    }
    updateItem(item.id, form);
    showToast('已更新');
    setIsEditing(false);
    setEditForm(null);
  };

  const handleDelete = () => {
    deleteItem(item.id);
    showToast('已删除豆愿');
    navigate('/wishlist');
  };

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(item.purchaseUrl)
      .then(() => showToast('链接已复制'))
      .catch(() => showToast('复制失败，请手动复制', 'error'));
  };

  return (
    <div className="min-h-screen bg-canvas pb-20">
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-ink-muted active:scale-[0.97] transition-all"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span className="text-sm">返回</span>
          </button>
          <h1 className="font-semibold text-ink">豆愿详情</h1>
          {isEditing ? (
            <button
              onClick={handleSave}
              className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg
                hover:bg-primary-active active:scale-[0.97] transition-all"
            >
              保存
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="px-3 py-1.5 text-sm text-ink-muted rounded-lg
                hover:bg-surface-card active:scale-[0.97] transition-all"
            >
              编辑
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {isEditing ? (
          <WishlistFormFields form={form} updateField={updateField} />
        ) : (
          <>
            <div className="bg-surface-card rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-xl font-bold text-ink">{item.name}</h2>
                    {flag && <span className="text-xl">{flag}</span>}
                  </div>
                  <p className="text-sm text-ink-muted">
                    {item.roaster ? `${item.roaster} · ` : ''}
                    {item.estate ? `${item.estate} · ` : ''}
                    {item.country}
                  </p>
                </div>
                <span className="text-sm px-2.5 py-1 rounded-full bg-canvas text-ink-muted font-medium">
                  {WISHLIST_PRIORITY_LABELS[item.priority]}
                </span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => navigate(`/add?fromWishlist=${item.id}`)}
                className="flex-1 py-3 bg-primary text-white font-medium rounded-xl
                  hover:bg-primary-active active:scale-[0.98] transition-all"
              >
                加入豆仓
              </button>
              {item.purchaseUrl.trim() && (
                <button
                  onClick={handleCopyLink}
                  className="flex-1 py-3 bg-surface-card text-ink-muted font-medium rounded-xl
                    hover:bg-surface-cream active:scale-[0.98] transition-all"
                >
                  复制链接
                </button>
              )}
            </div>

            <div className="bg-canvas rounded-xl border border-hairline p-5 space-y-4">
              <h3 className="text-sm font-semibold text-ink mb-3">详细信息</h3>
              <DetailRow label="产国" value={`${flag} ${item.country}`} />
              {item.estate ? <DetailRow label="庄园/产区" value={item.estate} /> : null}
              {item.variety ? <DetailRow label="豆种" value={item.variety} /> : null}
              {item.process ? <DetailRow label="处理法" value={PROCESS_LABELS[item.process]} /> : null}
              {item.roastLevel ? <DetailRow label="烘焙度" value={ROAST_LABELS[item.roastLevel]} /> : null}
              {item.price ? <DetailRow label="价格" value={item.price} /> : null}
              {item.purchaseUrl ? <DetailRow label="购买链接" value={item.purchaseUrl} wrap /> : null}
              {item.flavorNotes.length > 0 && (
                <div>
                  <span className="text-sm text-ink-soft block mb-1.5">风味描述</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.flavorNotes.map((note) => (
                      <span key={note} className="px-2.5 py-1 text-sm bg-primary-soft text-primary rounded-lg">
                        {note}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {item.reason.trim() && (
                <div>
                  <span className="text-sm text-ink-soft block mb-1.5">想买理由</span>
                  <p className="text-sm text-ink-body whitespace-pre-wrap">{item.reason}</p>
                </div>
              )}
            </div>
          </>
        )}

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 text-sm font-medium text-error
            bg-error-soft rounded-xl hover:bg-red-100
            active:scale-[0.98] transition-all"
        >
          删除
        </button>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="删除豆愿"
        description={`确定要删除「${item.name}」吗？`}
        confirmLabel="删除"
        onConfirm={handleDelete}
        variant="danger"
      />
    </div>
  );
}

function DetailRow({ label, value, wrap }: {
  label: string;
  value: string;
  wrap?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-hairline-soft last:border-0">
      <span className="text-sm text-ink-soft flex-shrink-0">{label}</span>
      <span className={`text-sm text-ink-body text-right ${wrap ? 'break-all' : ''}`}>{value}</span>
    </div>
  );
}
