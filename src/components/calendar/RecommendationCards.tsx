import type { RecommendationCard as RecommendationCardType } from '../../utils/calendar';

interface RecommendationCardsProps {
  month: number;
  monthLabel: string;
  cards: RecommendationCardType[];
}

function RecommendationCard({ card }: { card: RecommendationCardType }) {
  return (
    <div className="bg-canvas rounded-xl p-4 border border-hairline
      hover:border-hairline-soft hover:shadow-sm active:scale-[0.99]
      transition-all">
      {/* Header: country + flag + reason badge */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{card.flag}</span>
          <h3 className="font-semibold text-ink">{card.country}</h3>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0
          ${card.basisFromChart.startsWith('arrival')
            ? 'bg-teal-500/15 text-teal-700'
            : 'bg-coffee-amber/15 text-coffee-deep'}`}
        >
          {card.reason}
        </span>
      </div>

      {/* Flavor description */}
      <p className="text-sm text-ink-body leading-relaxed mb-2.5">
        {card.flavor}
      </p>

      {/* Flavor tags */}
      <div className="flex flex-wrap gap-1 mb-2.5">
        {card.flavorTags.map((tag) => (
          <span
            key={tag}
            className="text-xs px-2 py-0.5 rounded-full bg-canvas-warm text-ink-muted"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Process & Brewing */}
      <div className="flex flex-col gap-1.5 pt-2.5 border-t border-hairline-soft">
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-soft w-12 flex-shrink-0">处理法</span>
          <span className="text-xs text-ink-body">{card.processNotes.join(' / ')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ink-soft w-12 flex-shrink-0">冲煮</span>
          <span className="text-xs text-ink-body">{card.recommendedBrewing.join(' / ')}</span>
        </div>
      </div>

      {/* Positioning */}
      <p className="text-xs text-ink-soft mt-2 leading-relaxed">
        {card.appPositioning}
      </p>
    </div>
  );
}

export function RecommendationCards({ month, monthLabel, cards }: RecommendationCardsProps) {
  if (cards.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-lg font-bold text-ink mb-3">
        {monthLabel} &middot; 本月喝什么？
      </h2>
      <div className="flex flex-col gap-2.5">
        {cards.map((card) => (
          <RecommendationCard key={`${month}-${card.countryId}`} card={card} />
        ))}
      </div>
    </div>
  );
}