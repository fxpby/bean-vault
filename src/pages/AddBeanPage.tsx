import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBeanStore } from '../store/beanStore';
import { useToast } from '../components/ui/Toast';
import type { BeanCategory, BeanStatus, ProcessMethod, RoastLevel, BeanFormData } from '../types/bean';
import {
  COUNTRIES, CATEGORY_OPTIONS, STATUS_OPTIONS,
  PROCESS_OPTIONS, ROAST_OPTIONS, FLAVOR_SUGGESTIONS,
  DEFAULT_RESTING_DAYS,
} from '../constants';
import { todayString } from '../utils/resting';

export function AddBeanPage() {
  const navigate = useNavigate();
  const addBean = useBeanStore((s) => s.addBean);
  const { showToast } = useToast();

  const [form, setForm] = useState<BeanFormData>({
    name: '',
    category: 'pourover',
    status: 'shelf',
    country: '',
    countryCode: '',
    estate: '',
    variety: '',
    process: 'washed',
    roastLevel: 'medium',
    flavorNotes: [],
    pricePerGram: 0,
    restingDays: DEFAULT_RESTING_DAYS,
    productionDate: todayString(),
    notes: '',
  });

  const [flavorInput, setFlavorInput] = useState('');
  const [showFlavorSuggestions, setShowFlavorSuggestions] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  const updateField = <K extends keyof BeanFormData>(key: K, value: BeanFormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddFlavor = (note: string) => {
    const trimmed = note.trim();
    if (!trimmed || form.flavorNotes.includes(trimmed)) return;
    updateField('flavorNotes', [...form.flavorNotes, trimmed]);
    setFlavorInput('');
  };

  const handleRemoveFlavor = (note: string) => {
    updateField('flavorNotes', form.flavorNotes.filter((n) => n !== note));
  };

  const handleFlavorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddFlavor(flavorInput);
    }
  };

  const handleCountrySelect = (name: string, code: string) => {
    updateField('country', name);
    updateField('countryCode', code);
    setCountrySearch(name);
    setShowCountryDropdown(false);
  };

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.includes(countrySearch) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredFlavors = FLAVOR_SUGGESTIONS.filter(
    (f) => f.includes(flavorInput) && !form.flavorNotes.includes(f)
  );

  const handleSubmit = () => {
    if (!form.name.trim()) {
      showToast('请输入豆子名称', 'error');
      return;
    }
    if (!form.country.trim()) {
      showToast('请选择产国', 'error');
      return;
    }
    addBean(form);
    showToast('添加成功');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
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
          <h1 className="font-semibold text-ink">添加豆子</h1>
          <button
            onClick={handleSubmit}
            className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg
              hover:bg-primary-active active:scale-[0.97] transition-all"
          >
            保存
          </button>
        </div>
      </div>

      <div className="px-4 py-4 pb-24 space-y-5">
        {/* Name */}
        <FormField label="豆子名称" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="例如：花魁 7.0"
            className="form-input"
            autoFocus
          />
        </FormField>

        {/* Category */}
        <FormField label="分类" required>
          <div className="flex gap-2">
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('category', opt.value)}
                className={`flex-1 py-2 text-sm rounded-lg transition-all active:scale-[0.97]
                  ${form.category === opt.value
                    ? 'bg-primary text-white font-medium'
                    : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Status */}
        <FormField label="状态" required>
          <div className="flex gap-2">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('status', opt.value)}
                className={`flex-1 py-2 text-sm rounded-lg transition-all active:scale-[0.97]
                  ${form.status === opt.value
                    ? 'bg-primary text-white font-medium'
                    : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Country */}
        <FormField label="产国" required>
          <div className="relative">
            <input
              type="text"
              value={countrySearch}
              onChange={(e) => {
                setCountrySearch(e.target.value);
                updateField('country', e.target.value);
                setShowCountryDropdown(true);
              }}
              onFocus={() => setShowCountryDropdown(true)}
              onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
              placeholder="搜索或选择产国"
              className="form-input"
            />
            {showCountryDropdown && filteredCountries.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-canvas border border-hairline
                rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                {filteredCountries.map((c) => (
                  <button
                    key={c.code}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleCountrySelect(c.name, c.code);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-surface-card
                      flex items-center gap-2 transition-colors"
                  >
                    <span>{c.flag}</span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>

        {/* Estate + Variety */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="庄园">
            <input
              type="text"
              value={form.estate}
              onChange={(e) => updateField('estate', e.target.value)}
              placeholder="例如：Buku Abel"
              className="form-input"
            />
          </FormField>
          <FormField label="豆种">
            <input
              type="text"
              value={form.variety}
              onChange={(e) => updateField('variety', e.target.value)}
              placeholder="例如：74110"
              className="form-input"
            />
          </FormField>
        </div>

        {/* Process */}
        <FormField label="处理法">
          <div className="flex gap-2 flex-wrap">
            {PROCESS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('process', opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all active:scale-[0.97]
                  ${form.process === opt.value
                    ? 'bg-primary text-white font-medium'
                    : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Roast Level */}
        <FormField label="烘焙度">
          <div className="flex gap-2 flex-wrap">
            {ROAST_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateField('roastLevel', opt.value)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all active:scale-[0.97]
                  ${form.roastLevel === opt.value
                    ? 'bg-primary text-white font-medium'
                    : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
                  }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        {/* Flavor notes */}
        <FormField label="风味描述">
          <div className="relative">
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.flavorNotes.map((note) => (
                <span key={note} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm
                  bg-primary-soft text-primary rounded-lg">
                  {note}
                  <button
                    onClick={() => handleRemoveFlavor(note)}
                    className="hover:text-primary-active"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="2" strokeLinecap="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={flavorInput}
              onChange={(e) => {
                setFlavorInput(e.target.value);
                setShowFlavorSuggestions(true);
              }}
              onFocus={() => setShowFlavorSuggestions(true)}
              onBlur={() => setTimeout(() => setShowFlavorSuggestions(false), 200)}
              onKeyDown={handleFlavorKeyDown}
              placeholder="输入风味，回车添加"
              className="form-input"
            />
            {showFlavorSuggestions && flavorInput && filteredFlavors.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 bg-canvas border border-hairline
                rounded-lg shadow-lg max-h-36 overflow-y-auto z-10">
                {filteredFlavors.slice(0, 8).map((f) => (
                  <button
                    key={f}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleAddFlavor(f);
                    }}
                    className="w-full px-3 py-2 text-sm text-left hover:bg-surface-card transition-colors"
                  >
                    {f}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FormField>

        {/* Price */}
        <FormField label="克单价 (元/克)">
          <input
            type="number"
            value={form.pricePerGram || ''}
            onChange={(e) => updateField('pricePerGram', parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="form-input"
          />
        </FormField>

        {/* Resting Days */}
        <FormField label="养豆天数" required>
          <div className="flex items-center gap-3">
            <button
              onClick={() => updateField('restingDays', Math.max(0, form.restingDays - 1))}
              className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center
                text-ink-muted hover:bg-surface-cream active:scale-[0.97] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <input
              type="number"
              value={form.restingDays}
              onChange={(e) => updateField('restingDays', Math.max(0, parseInt(e.target.value) || 0))}
              className="w-20 text-center py-2 bg-surface-card rounded-lg text-sm font-medium
                text-ink outline-none"
              min="0"
            />
            <button
              onClick={() => updateField('restingDays', form.restingDays + 1)}
              className="w-9 h-9 rounded-lg bg-surface-card flex items-center justify-center
                text-ink-muted hover:bg-surface-cream active:scale-[0.97] transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <span className="text-sm text-ink-muted">天</span>
          </div>
        </FormField>

        {/* Production Date */}
        <FormField label="生产日期" required>
          <input
            type="date"
            value={form.productionDate}
            onChange={(e) => updateField('productionDate', e.target.value)}
            max={todayString()}
            className="form-input"
          />
        </FormField>

        {/* Notes */}
        <FormField label="备注">
          <textarea
            value={form.notes}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="记录冲煮建议、购买渠道或其他想记住的信息"
            className="form-input w-full min-h-24 resize-y"
          />
        </FormField>
      </div>
    </div>
  );
}

function FormField({ label, required, children }: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-ink mb-1.5">
        {label}
        {required && <span className="text-primary ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
