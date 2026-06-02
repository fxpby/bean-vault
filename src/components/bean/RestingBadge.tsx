import { isRested, getDaysUntilRested, getRestedDateString } from '../../utils/resting';

interface RestingBadgeProps {
  productionDate: string;
  restingDays: number;
  size?: 'sm' | 'md';
}

export function RestingBadge({ productionDate, restingDays, size = 'md' }: RestingBadgeProps) {
  const rested = isRested(productionDate, restingDays);
  const daysUntil = getDaysUntilRested(productionDate, restingDays);
  const restedDate = getRestedDateString(productionDate, restingDays);

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';

  if (rested) {
    return (
      <span className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full
        bg-success-soft text-success font-medium`}>
        <span className="w-1.5 h-1.5 rounded-full bg-success" />
        养好了
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${sizeClass} rounded-full
      bg-warning-soft text-warning font-medium resting-pulse`}>
      <span className="w-1.5 h-1.5 rounded-full bg-warning" />
      还需 {daysUntil} 天
      <span className="text-ink-soft font-normal ml-0.5">({restedDate})</span>
    </span>
  );
}