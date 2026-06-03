import { useMemo } from "react";
import {
  buildHeatmapMatrix,
  getMonthLabel,
  type CellStatus,
} from "../../utils/calendar";

interface HeatmapCalendarProps {
  selectedMonth: number;
  currentMonth: number;
  onSelectMonth: (month: number) => void;
}

const STATUS_COLORS: Record<CellStatus, string> = {
  harvest_primary: "bg-coffee-amber",
  harvest_secondary: "bg-coffee-amber/40",
  arrival_primary: "bg-teal-500",
  arrival_secondary: "bg-teal-500/40",
  none: "bg-surface-card",
};

export function HeatmapCalendar({
  selectedMonth,
  currentMonth,
  onSelectMonth,
}: HeatmapCalendarProps) {
  const matrix = useMemo(() => buildHeatmapMatrix(), []);

  const months = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }, []);

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="min-w-[340px]">
        {/* Month header row */}
        <div className="flex items-center mb-1">
          <div className="w-[72px] flex-shrink-0" />
          {months.map((month) => {
            const isCurrent = month === currentMonth;
            const isSelected = month === selectedMonth;
            return (
              <button
                key={month}
                onClick={() => onSelectMonth(month)}
                className={`w-[22px] flex-shrink-0 text-center text-xs font-medium py-1
                  active:scale-[0.97] transition-all cursor-pointer
                  ${isSelected ? "text-primary font-bold" : isCurrent ? "text-primary" : "text-ink-muted"}
                  ${isSelected ? "border-b-2 border-primary" : ""}
                  ${isCurrent && !isSelected ? "border-b border-primary/50" : ""}`}
              >
                {getMonthLabel(month)}
              </button>
            );
          })}
        </div>

        {/* Country rows */}
        {matrix.map((row) => (
          <div key={row.countryId} className="flex items-center mb-0.5">
            {/* Country label */}
            <div className="w-[72px] flex-shrink-0 text-xs text-ink-muted truncate pr-1">
              <span className="mr-0.5">{row.flag}</span>
              {row.countryName}
            </div>

            {/* Cells */}
            {row.cells.map((cell) => {
              const isCurrentCol = cell.month === currentMonth;
              const isSelectedCol = cell.month === selectedMonth;
              return (
                <div
                  key={`${cell.countryId}-${cell.month}`}
                  className={`w-[22px] h-[22px] flex-shrink-0 rounded-[3px] transition-all
                    ${STATUS_COLORS[cell.status]}
                    ${
                      cell.status === "harvest_secondary" ||
                      cell.status === "arrival_secondary"
                        ? "stripe-pattern"
                        : ""
                    }
                    ${isSelectedCol ? "ring-2 ring-primary ring-offset-1 ring-offset-canvas" : ""}
                    ${isCurrentCol && !isSelectedCol ? "ring-1 ring-primary/30 ring-offset-1 ring-offset-canvas" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
