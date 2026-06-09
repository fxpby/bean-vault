import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBeanStore } from '../store/beanStore';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { RestingBadge } from '../components/bean/RestingBadge';
import {
  CATEGORY_LABELS, STATUS_LABELS, PROCESS_LABELS, ROAST_LABELS,
  COUNTRIES, CATEGORY_OPTIONS, PROCESS_OPTIONS, ROAST_OPTIONS, STATUS_OPTIONS,
  FLAVOR_SUGGESTIONS,
} from '../constants';
import { formatDate, todayString } from '../utils/resting';
import type { BeanFormData, BeanStatus } from '../types/bean';

export function BeanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const beans = useBeanStore((s) => s.beans);
  const updateBean = useBeanStore((s) => s.updateBean);
  const setBeanStatus = useBeanStore((s) => s.setBeanStatus);
  const deleteBean = useBeanStore((s) => s.deleteBean);
  const permanentlyDeleteBean = useBeanStore((s) => s.permanentlyDeleteBean);
  const { showToast } = useToast();

  const bean = beans.find((b) => b.id === id);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPermDeleteConfirm, setShowPermDeleteConfirm] = useState(false);
  const [showFinishConfirm, setShowFinishConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<BeanFormData>>({});
  const [countrySearch, setCountrySearch] = useState('');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [newFlavorInput, setNewFlavorInput] = useState('');
  const [showFlavorSuggestions, setShowFlavorSuggestions] = useState(false);

  if (!bean) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-muted mb-4">豆子不存在或已被删除</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-white rounded-lg text-sm"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const handleStartDrinking = () => {
    setBeanStatus(bean.id, 'drinking');
    showToast('已标记为正在喝');
  };

  const handleConfirmFinish = () => {
    setBeanStatus(bean.id, 'finished');
    setShowFinishConfirm(false);
    showToast('已标记为已喝完');
  };

  const handleBackToDrinking = () => {
    setBeanStatus(bean.id, 'drinking');
    showToast('已恢复为正在喝');
  };

  const handleBackToShelf = () => {
    setBeanStatus(bean.id, 'shelf');
    showToast('已放回架子');
  };

  const handleDelete = () => {
    deleteBean(bean.id);
    showToast('已移至回收站');
    navigate('/');
  };

  const handlePermDelete = () => {
    permanentlyDeleteBean(bean.id);
    showToast('已彻底删除');
    navigate('/');
  };

  const handleRestore = () => {
    useBeanStore.getState().restoreBean(bean.id);
    showToast('已恢复');
  };

  const handleSaveEdit = () => {
    if (editForm.name !== undefined && !editForm.name.trim()) {
      showToast('名称不能为空', 'error');
      return;
    }
    updateBean(bean.id, editForm);
    showToast('已更新');
    setIsEditing(false);
  };

  const addFlavorNote = (note: string) => {
    const trimmed = note.trim();
    if (!trimmed) return;
    const current = editForm.flavorNotes || bean.flavorNotes;
    if (current.includes(trimmed)) {
      showToast('风味已存在', 'error');
      return;
    }
    setEditForm({ ...editForm, flavorNotes: [...current, trimmed] });
    setNewFlavorInput('');
  };

  const handleFlavorKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addFlavorNote(newFlavorInput);
    }
  };

  const filteredFlavors = FLAVOR_SUGGESTIONS.filter(
    (f) => f.includes(newFlavorInput) && !(editForm.flavorNotes || bean.flavorNotes).includes(f)
  );

  const flag = bean.countryCode
    ? String.fromCodePoint(...[...bean.countryCode.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65))
    : '';

  return (
    <div className="min-h-screen bg-canvas pb-20">
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
          <h1 className="font-semibold text-ink">豆子详情</h1>
          {isEditing ? (
            <button
              onClick={handleSaveEdit}
              className="px-4 py-1.5 bg-primary text-white text-sm font-medium rounded-lg
                hover:bg-primary-active active:scale-[0.97] transition-all"
            >
              保存
            </button>
          ) : (
            <button
              onClick={() => {
                setEditForm({
                  name: bean.name,
                  category: bean.category,
                  country: bean.country,
                  countryCode: bean.countryCode || '',
                  estate: bean.estate,
                  variety: bean.variety,
                  process: bean.process,
                  roastLevel: bean.roastLevel,
                  pricePerGram: bean.pricePerGram,
                  restingDays: bean.restingDays,
                  productionDate: bean.productionDate,
                  flavorNotes: bean.flavorNotes,
                  notes: bean.notes ?? '',
                  status: bean.status,
                });
                setCountrySearch(bean.country);
                setNewFlavorInput('');
                setIsEditing(true);
              }}
              className="px-3 py-1.5 text-sm text-ink-muted rounded-lg
                hover:bg-surface-card active:scale-[0.97] transition-all"
            >
              编辑
            </button>
          )}
        </div>
      </div>

      <div className="px-4 py-4 space-y-5">
        {/* Hero info */}
        <div className="bg-surface-card rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.name || bean.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="text-lg font-bold text-ink bg-canvas rounded-lg px-2 py-1 border border-hairline"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-ink">{bean.name}</h2>
                )}
                {flag && <span className="text-xl">{flag}</span>}
              </div>
              <p className="text-sm text-ink-muted">
                {bean.estate ? `${bean.estate} · ` : ''}{bean.country}
              </p>
            </div>
            <span className="text-sm px-2.5 py-1 rounded-full bg-canvas text-ink-muted font-medium">
              {CATEGORY_LABELS[bean.category]}
            </span>
          </div>

          <RestingBadge productionDate={bean.productionDate} restingDays={bean.restingDays} size="md" />
        </div>

        {/* Status actions */}
        {!isEditing && !bean.isDeleted && (
          <div className="flex gap-3 flex-wrap">
            {bean.status === 'shelf' && (
              <button
                onClick={handleStartDrinking}
                className="flex-1 py-3 bg-primary text-white font-medium rounded-xl
                  hover:bg-primary-active active:scale-[0.98] transition-all"
              >
                开始喝
              </button>
            )}
            {bean.status === 'drinking' && (
              <>
                <button
                  onClick={() => setShowFinishConfirm(true)}
                  className="flex-1 py-3 bg-surface-card text-ink-muted font-medium rounded-xl
                    hover:bg-surface-cream active:scale-[0.98] transition-all"
                >
                  喝完了
                </button>
                <button
                  onClick={handleBackToShelf}
                  className="flex-1 py-3 bg-surface-card text-ink-muted font-medium rounded-xl
                    hover:bg-surface-cream active:scale-[0.98] transition-all"
                >
                  放回架子
                </button>
              </>
            )}
            {bean.status === 'finished' && (
              <button
                onClick={handleBackToDrinking}
                className="flex-1 py-3 bg-primary text-white font-medium rounded-xl
                  hover:bg-primary-active active:scale-[0.98] transition-all"
              >
                重新开始喝
              </button>
            )}
            {bean.status === 'fridge' && (
              <>
                <button
                  onClick={handleStartDrinking}
                  className="flex-1 py-3 bg-primary text-white font-medium rounded-xl
                    hover:bg-primary-active active:scale-[0.98] transition-all"
                >
                  拿出来喝
                </button>
                <button
                  onClick={handleBackToShelf}
                  className="flex-1 py-3 bg-surface-card text-ink-muted font-medium rounded-xl
                    hover:bg-surface-cream active:scale-[0.98] transition-all"
                >
                  放回架子
                </button>
              </>
            )}
          </div>
        )}

        {/* Detail info grid */}
        <div className="bg-canvas rounded-xl border border-hairline p-5 space-y-4">
          <h3 className="text-sm font-semibold text-ink mb-3">详细信息</h3>

          <DetailRow label="分类">
            {isEditing ? (
              <div className="flex gap-1.5">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm({ ...editForm, category: opt.value })}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all active:scale-[0.97]
                      ${(editForm.category || bean.category) === opt.value
                        ? 'bg-primary text-white font-medium'
                        : 'bg-surface-card text-ink-muted'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-ink-body text-right">{CATEGORY_LABELS[bean.category]}</span>
            )}
          </DetailRow>
          <DetailRow label="状态">
            {isEditing ? (
              <div className="flex gap-1.5">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm({ ...editForm, status: opt.value })}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all active:scale-[0.97]
                      ${(editForm.status || bean.status) === opt.value
                        ? 'bg-primary text-white font-medium'
                        : 'bg-surface-card text-ink-muted'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-ink-body text-right">{STATUS_LABELS[bean.status]}</span>
            )}
          </DetailRow>
          <DetailRow label="产国">
            {isEditing ? (
              <div className="relative">
                <input
                  type="text"
                  value={countrySearch}
                  onChange={(e) => {
                    setCountrySearch(e.target.value);
                    setEditForm({ ...editForm, country: e.target.value });
                    setShowCountryDropdown(true);
                  }}
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 200)}
                  placeholder="搜索产国"
                  className="text-sm text-right text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline w-36"
                />
                {showCountryDropdown && COUNTRIES.filter((c) =>
                  c.name.includes(countrySearch) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
                ).length > 0 && (
                  <div className="absolute right-0 top-full mt-1 bg-canvas border border-hairline
                    rounded-lg shadow-lg max-h-36 overflow-y-auto z-10 w-40">
                    {COUNTRIES.filter((c) =>
                      c.name.includes(countrySearch) || c.code.toLowerCase().includes(countrySearch.toLowerCase())
                    ).map((c) => (
                      <button
                        key={c.code}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          setEditForm({ ...editForm, country: c.name, countryCode: c.code });
                          setCountrySearch(c.name);
                          setShowCountryDropdown(false);
                        }}
                        className="w-full px-3 py-1.5 text-sm text-left hover:bg-surface-card
                          flex items-center gap-2 transition-colors"
                      >
                        <span>{c.flag}</span>
                        <span>{c.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <span className="text-sm text-ink-body text-right">{flag} {bean.country}</span>
            )}
          </DetailRow>

          {isEditing ? (
            <DetailRow label="庄园/产区">
              <input
                type="text"
                value={editForm.estate ?? bean.estate}
                onChange={(e) => setEditForm({ ...editForm, estate: e.target.value })}
                className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline w-full"
              />
            </DetailRow>
          ) : (
            bean.estate ? <DetailRow label="庄园/产区" value={bean.estate} /> : null
          )}

          {isEditing ? (
            <DetailRow label="豆种">
              <input
                type="text"
                value={editForm.variety ?? bean.variety}
                onChange={(e) => setEditForm({ ...editForm, variety: e.target.value })}
                className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline w-full"
              />
            </DetailRow>
          ) : (
            bean.variety ? <DetailRow label="豆种" value={bean.variety} /> : null
          )}

          <DetailRow label="处理法">
            {isEditing ? (
              <div className="flex gap-1.5">
                {PROCESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm({ ...editForm, process: opt.value })}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all active:scale-[0.97]
                      ${(editForm.process || bean.process) === opt.value
                        ? 'bg-primary text-white font-medium'
                        : 'bg-surface-card text-ink-muted'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-ink-body text-right">{PROCESS_LABELS[bean.process]}</span>
            )}
          </DetailRow>
          <DetailRow label="烘焙度">
            {isEditing ? (
              <div className="flex gap-1.5">
                {ROAST_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEditForm({ ...editForm, roastLevel: opt.value })}
                    className={`px-2.5 py-1 text-xs rounded-lg transition-all active:scale-[0.97]
                      ${(editForm.roastLevel || bean.roastLevel) === opt.value
                        ? 'bg-primary text-white font-medium'
                        : 'bg-surface-card text-ink-muted'
                      }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <span className="text-sm text-ink-body text-right">{ROAST_LABELS[bean.roastLevel]}</span>
            )}
          </DetailRow>

          <div>
            <span className="text-sm text-ink-soft block mb-1.5">风味描述</span>
            {isEditing ? (
              <div className="relative">
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(editForm.flavorNotes || bean.flavorNotes).map((note) => (
                    <span key={note} className="inline-flex items-center gap-1 px-2.5 py-1 text-sm
                      bg-primary-soft text-primary rounded-lg">
                      {note}
                      <button
                        onClick={() => setEditForm({
                          ...editForm,
                          flavorNotes: (editForm.flavorNotes || bean.flavorNotes).filter((n) => n !== note),
                        })}
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
                  value={newFlavorInput}
                  onChange={(e) => {
                    setNewFlavorInput(e.target.value);
                    setShowFlavorSuggestions(true);
                  }}
                  onFocus={() => setShowFlavorSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowFlavorSuggestions(false), 200)}
                  onKeyDown={handleFlavorKeyDown}
                  placeholder="输入风味，回车添加"
                  className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1.5 border border-hairline w-full"
                />
                {showFlavorSuggestions && newFlavorInput && filteredFlavors.length > 0 && (
                  <div className="absolute top-full mt-1 left-0 right-0 bg-canvas border border-hairline
                    rounded-lg shadow-lg max-h-36 overflow-y-auto z-10">
                    {filteredFlavors.slice(0, 8).map((f) => (
                      <button
                        key={f}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addFlavorNote(f);
                        }}
                        className="w-full px-3 py-2 text-sm text-left hover:bg-surface-card transition-colors"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {bean.flavorNotes.map((note) => (
                  <span key={note} className="px-2.5 py-1 text-sm bg-canvas-warm text-ink-muted rounded-lg">
                    {note}
                  </span>
                ))}
              </div>
            )}
          </div>

          {isEditing ? (
            <DetailRow label="克单价">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editForm.pricePerGram ?? bean.pricePerGram}
                  onChange={(e) => setEditForm({ ...editForm, pricePerGram: parseFloat(e.target.value) || 0 })}
                  className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline w-24"
                  step="0.01"
                  min="0"
                />
                <span className="text-xs text-ink-muted">元/克</span>
              </div>
            </DetailRow>
          ) : (
            bean.pricePerGram > 0 ? (
              <DetailRow label="克单价" value={`¥${bean.pricePerGram.toFixed(2)}/克`} />
            ) : null
          )}

          {isEditing ? (
            <DetailRow label="养豆天数">
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={editForm.restingDays ?? bean.restingDays}
                  onChange={(e) => setEditForm({ ...editForm, restingDays: Math.max(0, parseInt(e.target.value) || 0) })}
                  className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline w-20"
                  min="0"
                />
                <span className="text-xs text-ink-muted">天</span>
              </div>
            </DetailRow>
          ) : (
            <DetailRow label="养豆天数" value={`${bean.restingDays} 天`} />
          )}

          <DetailRow label="生产日期">
            {isEditing ? (
              <input
                type="date"
                value={editForm.productionDate ?? bean.productionDate}
                onChange={(e) => setEditForm({ ...editForm, productionDate: e.target.value })}
                max={todayString()}
                className="text-sm text-right text-ink-body bg-surface-card rounded-lg px-2 py-1 border border-hairline"
              />
            ) : (
              <span className="text-sm text-ink-body text-right">{formatDate(bean.productionDate)}</span>
            )}
          </DetailRow>

          {(isEditing || (bean.notes ?? '').trim()) && (
            <div className="py-2 border-b border-hairline-soft">
              <span className="text-sm text-ink-soft block mb-1.5">备注</span>
              {isEditing ? (
                <textarea
                  value={editForm.notes ?? bean.notes ?? ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="记录冲煮建议、购买渠道或其他想记住的信息"
                  className="text-sm text-ink-body bg-surface-card rounded-lg px-2 py-1.5 border border-hairline w-full min-h-24 resize-y"
                />
              ) : (
                <p className="text-sm text-ink-body whitespace-pre-wrap">{bean.notes ?? ''}</p>
              )}
            </div>
          )}
          <DetailRow label="添加日期" value={formatDate(bean.createdAt.split('T')[0])} />
        </div>

        {/* Delete actions */}
        <div className="pt-2 space-y-3">
          {bean.isDeleted ? (
            <>
              <button
                onClick={handleRestore}
                className="w-full py-3 text-sm font-medium text-primary
                  bg-primary-soft rounded-xl hover:bg-primary-light
                  active:scale-[0.98] transition-all"
              >
                恢复豆子
              </button>
              <button
                onClick={() => setShowPermDeleteConfirm(true)}
                className="w-full py-3 text-sm font-medium text-error
                  bg-error-soft rounded-xl hover:bg-red-100
                  active:scale-[0.98] transition-all"
              >
                彻底删除
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full py-3 text-sm font-medium text-error
                bg-error-soft rounded-xl hover:bg-red-100
                active:scale-[0.98] transition-all"
            >
              删除
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="删除豆子"
        description={`确定要删除「${bean.name}」吗？删除后可以在回收站中找到。`}
        confirmLabel="删除"
        onConfirm={handleDelete}
        variant="danger"
      />

      <ConfirmDialog
        open={showFinishConfirm}
        onOpenChange={setShowFinishConfirm}
        title="确认喝完了"
        description={`确定「${bean.name}」已经喝完了吗？确认后可在设置中重新开始喝。`}
        confirmLabel="喝完了"
        onConfirm={handleConfirmFinish}
        variant="default"
      />

      <ConfirmDialog
        open={showPermDeleteConfirm}
        onOpenChange={setShowPermDeleteConfirm}
        title="彻底删除"
        description={`确定要彻底删除「${bean.name}」吗？此操作不可撤销。`}
        confirmLabel="彻底删除"
        onConfirm={handlePermDelete}
        variant="danger"
      />
    </div>
  );
}

function DetailRow({ label, value, children }: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-hairline-soft last:border-0">
      <span className="text-sm text-ink-soft">{label}</span>
      {children || <span className="text-sm text-ink-body text-right">{value}</span>}
    </div>
  );
}
