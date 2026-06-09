import { useState } from 'react';
import type { WishlistFormData } from '../../types/bean';
import {
  COUNTRIES,
  FLAVOR_SUGGESTIONS,
  PROCESS_OPTIONS,
  ROAST_OPTIONS,
  WISHLIST_PRIORITY_OPTIONS,
} from '../../constants';

interface WishlistFormFieldsProps {
  form: WishlistFormData;
  updateField: <K extends keyof WishlistFormData>(key: K, value: WishlistFormData[K]) => void;
}

export function WishlistFormFields({ form, updateField }: WishlistFormFieldsProps) {
  const [countrySearch, setCountrySearch] = useState(form.country);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [flavorInput, setFlavorInput] = useState('');
  const [showFlavorSuggestions, setShowFlavorSuggestions] = useState(false);

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.includes(countrySearch) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const filteredFlavors = FLAVOR_SUGGESTIONS.filter(
    (f) => f.includes(flavorInput) && !form.flavorNotes.includes(f)
  );

  const handleCountrySelect = (name: string, code: string) => {
    updateField('country', name);
    updateField('countryCode', code);
    setCountrySearch(name);
    setShowCountryDropdown(false);
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

  return (
    <div className="space-y-5">
      <FormField label="豆子名称" required>
        <input
          type="text"
          value={form.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="例如：花魁 8.0"
          className="form-input"
          autoFocus
        />
      </FormField>

      <FormField label="烘焙商/店铺">
        <input
          type="text"
          value={form.roaster}
          onChange={(e) => updateField('roaster', e.target.value)}
          placeholder="例如：某某咖啡"
          className="form-input"
        />
      </FormField>

      <FormField label="产国" required>
        <div className="relative">
          <input
            type="text"
            value={countrySearch}
            onChange={(e) => {
              setCountrySearch(e.target.value);
              updateField('country', e.target.value);
              updateField('countryCode', '');
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

      <div className="grid grid-cols-2 gap-4">
        <FormField label="庄园/产区">
          <input
            type="text"
            value={form.estate}
            onChange={(e) => updateField('estate', e.target.value)}
            placeholder="例如：Buku Abel / 蕙兰"
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

      <FormField label="优先级">
        <div className="grid grid-cols-4 gap-2">
          {WISHLIST_PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateField('priority', opt.value)}
              className={`py-2 text-xs rounded-lg transition-all active:scale-[0.97]
                ${form.priority === opt.value
                  ? 'bg-primary text-white font-medium'
                  : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </FormField>

      <FormField label="处理法">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => updateField('process', undefined)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all active:scale-[0.97]
              ${form.process === undefined
                ? 'bg-primary text-white font-medium'
                : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
              }`}
          >
            未填写
          </button>
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

      <FormField label="烘焙度">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => updateField('roastLevel', undefined)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all active:scale-[0.97]
              ${form.roastLevel === undefined
                ? 'bg-primary text-white font-medium'
                : 'bg-surface-card text-ink-muted hover:bg-surface-cream'
              }`}
          >
            未填写
          </button>
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

      <FormField label="价格">
        <input
          type="text"
          value={form.price}
          onChange={(e) => updateField('price', e.target.value)}
          placeholder="例如：98 元 / 100g"
          className="form-input"
        />
      </FormField>

      <FormField label="购买链接">
        <input
          type="url"
          value={form.purchaseUrl}
          onChange={(e) => updateField('purchaseUrl', e.target.value)}
          placeholder="https://"
          className="form-input"
        />
      </FormField>

      <FormField label="想买理由">
        <textarea
          value={form.reason}
          onChange={(e) => updateField('reason', e.target.value)}
          placeholder="记录为什么想买、适合什么冲煮或其他备注"
          className="form-input w-full min-h-24 resize-y"
        />
      </FormField>
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
