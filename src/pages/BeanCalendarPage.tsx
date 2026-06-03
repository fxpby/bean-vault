import { useState, useMemo } from "react";
import {
  getCurrentMonth,
  getMonthLabel,
  getRecommendationsForMonth,
} from "../utils/calendar";
import { HeatmapCalendar } from "../components/calendar/HeatmapCalendar";
import { RecommendationCards } from "../components/calendar/RecommendationCards";
import { Legend } from "../components/calendar/Legend";

export function BeanCalendarPage() {
  const currentMonth = useMemo(() => getCurrentMonth(), []);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthLabel = getMonthLabel(selectedMonth);
  const recommendations = useMemo(
    () => getRecommendationsForMonth(selectedMonth),
    [selectedMonth],
  );

  return (
    <div className="min-h-screen bg-canvas pb-20">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-canvas/95 backdrop-blur-sm border-b border-hairline-soft">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-ink">豆历 🗓</h1>
          <p className="text-xs text-ink-muted mt-1">
            全球咖啡采收 &middot; 到港日历
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 max-w-lg mx-auto">
        {/* Month selector pills */}
        <div className="flex gap-1 overflow-x-auto scrollbar-hide mb-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
            <button
              key={month}
              onClick={() => setSelectedMonth(month)}
              className={`px-3 py-1.5 text-xs rounded-lg flex-shrink-0
                active:scale-[0.97] transition-all
                ${
                  month === selectedMonth
                    ? "bg-primary text-white font-medium"
                    : month === currentMonth
                      ? "bg-primary-soft text-primary font-medium"
                      : "bg-surface-card text-ink-muted"
                }`}
            >
              {getMonthLabel(month)}
            </button>
          ))}
        </div>

        {/* Heatmap */}
        <HeatmapCalendar
          selectedMonth={selectedMonth}
          currentMonth={currentMonth}
          onSelectMonth={setSelectedMonth}
        />

        {/* Legend */}
        <Legend />

        {/* Recommendation cards */}
        <RecommendationCards
          month={selectedMonth}
          monthLabel={monthLabel}
          cards={recommendations}
        />
      </div>
    </div>
  );
}
