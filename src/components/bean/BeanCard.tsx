import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Bean } from "../../types/bean";
import { CATEGORY_LABELS, PROCESS_LABELS, ROAST_LABELS } from "../../constants";
import { formatDate } from "../../utils/resting";
import { RestingBadge } from "./RestingBadge";
import { useBeanStore } from "../../store/beanStore";
import { useToast } from "../ui/Toast";
import { ConfirmDialog } from "../ui/ConfirmDialog";

interface BeanCardProps {
  bean: Bean;
  isTrash?: boolean;
}

export function BeanCard({ bean, isTrash }: BeanCardProps) {
  const navigate = useNavigate();
  const setBeanStatus = useBeanStore((s) => s.setBeanStatus);
  const deleteBean = useBeanStore((s) => s.deleteBean);
  const restoreBean = useBeanStore((s) => s.restoreBean);
  const permanentlyDeleteBean = useBeanStore((s) => s.permanentlyDeleteBean);
  const { showToast } = useToast();

  const [showPermDeleteConfirm, setShowPermDeleteConfirm] = useState(false);

  const handleStartDrinking = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBeanStatus(bean.id, "drinking");
    showToast("已标记为正在喝");
  };

  const handleFinish = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBeanStatus(bean.id, "finished");
    showToast("已标记为已喝完");
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    restoreBean(bean.id);
    showToast("已恢复");
  };

  const handlePermDelete = () => {
    permanentlyDeleteBean(bean.id);
    showToast("已彻底删除");
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const flag = bean.countryCode
      ? String.fromCodePoint(
          ...[...bean.countryCode.toUpperCase()].map(
            (c) => 0x1f1e6 + c.charCodeAt(0) - 65,
          ),
        )
      : "";
    const text = [
      `☕ ${bean.name} ${flag}`,
      `产区：${bean.country}${bean.estate ? ` · ${bean.estate}` : ""}`,
      `豆种：${bean.variety || "-"}`,
      `处理法：${PROCESS_LABELS[bean.process]}  烘焙度：${ROAST_LABELS[bean.roastLevel]}`,
      `风味：${bean.flavorNotes.length > 0 ? bean.flavorNotes.join("、") : "-"}`,
      `养豆：${bean.restingDays} 天  生产日期：${formatDate(bean.productionDate)}`,
      bean.pricePerGram > 0
        ? `克单价：¥${bean.pricePerGram.toFixed(2)}/克`
        : "",
    ]
      .filter(Boolean)
      .join("\n");
    navigator.clipboard
      .writeText(text)
      .then(() => {
        showToast("已复制到剪贴板");
      })
      .catch(() => {
        showToast("复制失败", "error");
      });
  };

  const statusBadge = (() => {
    if (bean.status === "drinking")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-soft text-primary font-medium">
          正在喝
        </span>
      );
    if (bean.status === "finished")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-ink-soft/20 text-ink-muted font-medium">
          已喝完
        </span>
      );
    if (bean.status === "fridge")
      return (
        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-medium">
          冰箱
        </span>
      );
    return null;
  })();

  return (
    <>
      <div
        onClick={() => !isTrash && navigate(`/bean/${bean.id}`)}
        className="bg-canvas rounded-xl p-4 border border-hairline
        hover:border-hairline-soft hover:shadow-sm active:scale-[0.99]
        transition-all cursor-pointer"
      >
        {/* Top row: name + category */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-ink truncate">{bean.name}</h3>
              {bean.countryCode && (
                <span className="text-base flex-shrink-0">
                  {String.fromCodePoint(
                    ...[...bean.countryCode.toUpperCase()].map(
                      (c) => 0x1f1e6 + c.charCodeAt(0) - 65,
                    ),
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              {bean.estate ? `${bean.estate} · ` : ""}
              {bean.country}
            </p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-surface-card text-ink-muted font-medium flex-shrink-0">
            {CATEGORY_LABELS[bean.category]}
          </span>
        </div>

        {/* Flavor tags */}
        {bean.flavorNotes.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {bean.flavorNotes.slice(0, 6).map((note) => (
              <span
                key={note}
                className="text-xs px-2 py-0.5 rounded-full bg-canvas-warm text-ink-muted"
              >
                {note}
              </span>
            ))}
            {bean.flavorNotes.length > 6 && (
              <span className="text-xs text-ink-soft">
                +{bean.flavorNotes.length - 6}
              </span>
            )}
          </div>
        )}

        {/* Bottom row: resting status + actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isTrash ? (
              <span className="text-xs text-ink-soft">
                {formatDate(bean.productionDate)}
              </span>
            ) : (
              <>
                <RestingBadge
                  productionDate={bean.productionDate}
                  restingDays={bean.restingDays}
                />
                {statusBadge}
              </>
            )}
          </div>

          {!isTrash && (
            <div className="flex items-center gap-1">
              {bean.status === "shelf" && (
                <button
                  onClick={handleStartDrinking}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                  bg-primary text-white rounded-lg hover:bg-primary-active
                  active:scale-[0.97] transition-all"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  开始喝
                </button>
              )}
              {bean.status === "drinking" && (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium
                  bg-surface-card text-ink-muted rounded-lg
                  hover:bg-surface-cream active:scale-[0.97] transition-all"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  喝完了
                </button>
              )}
            </div>
          )}

          {isTrash && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleRestore}
                className="px-2.5 py-1.5 text-xs font-medium text-primary
                hover:bg-primary-soft rounded-lg active:scale-[0.97] transition-all"
              >
                恢复
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowPermDeleteConfirm(true);
                }}
                className="px-2.5 py-1.5 text-xs font-medium text-error
                hover:bg-error-soft rounded-lg active:scale-[0.97] transition-all"
              >
                彻底删除
              </button>
            </div>
          )}
        </div>

        {/* Price & date info */}
        {!isTrash && (
          <div className="flex items-center justify-between gap-3 mt-2.5 pt-2.5 border-t border-hairline-soft">
            <div className="flex items-center gap-3">
              {bean.pricePerGram > 0 && (
                <span className="text-xs text-ink-muted">
                  ¥{bean.pricePerGram.toFixed(2)}/g
                </span>
              )}
              <span className="text-xs text-ink-soft">
                生产 {formatDate(bean.productionDate)}
              </span>
              <span className="text-xs text-ink-soft">
                养豆 {bean.restingDays} 天
              </span>
            </div>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 px-2 py-1 text-xs text-ink-soft
              hover:text-primary hover:bg-primary-soft rounded-lg
              active:scale-[0.97] transition-all flex-shrink-0"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              分享
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showPermDeleteConfirm}
        onOpenChange={setShowPermDeleteConfirm}
        title="彻底删除"
        description={`确定要彻底删除「${bean.name}」吗？此操作不可撤销。`}
        confirmLabel="彻底删除"
        onConfirm={handlePermDelete}
        variant="danger"
      />
    </>
  );
}
