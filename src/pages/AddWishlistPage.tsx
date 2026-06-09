import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WishlistFormFields } from '../components/wishlist/WishlistFormFields';
import { useToast } from '../components/ui/Toast';
import { useWishlistStore } from '../store/wishlistStore';
import type { WishlistFormData } from '../types/bean';

const EMPTY_WISHLIST_FORM: WishlistFormData = {
  name: '',
  roaster: '',
  country: '',
  countryCode: '',
  estate: '',
  variety: '',
  process: undefined,
  roastLevel: undefined,
  flavorNotes: [],
  price: '',
  purchaseUrl: '',
  reason: '',
  priority: 'normal',
};

export function AddWishlistPage() {
  const navigate = useNavigate();
  const addItem = useWishlistStore((s) => s.addItem);
  const { showToast } = useToast();
  const [form, setForm] = useState<WishlistFormData>(EMPTY_WISHLIST_FORM);

  const updateField = <K extends keyof WishlistFormData>(key: K, value: WishlistFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入豆子名称', 'error');
      return;
    }
    if (!form.country.trim() || !form.countryCode.trim()) {
      showToast('请选择产国', 'error');
      return;
    }

    const item = addItem(form);
    showToast('已加入豆愿');
    navigate(`/wishlist/${item.id}`, { replace: true });
  };

  return (
    <div className="min-h-screen bg-canvas">
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
          <h1 className="font-semibold text-ink">新增豆愿</h1>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg
              hover:bg-primary-active active:scale-[0.97] transition-all"
          >
            保存
          </button>
        </div>
      </div>

      <div className="px-4 py-4 pb-24">
        <WishlistFormFields form={form} updateField={updateField} />
      </div>
    </div>
  );
}
