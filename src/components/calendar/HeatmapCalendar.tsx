import { useMemo, useRef, useEffect, useState } from "react";
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

// Debounce utility
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export function HeatmapCalendar({
  selectedMonth,
  currentMonth,
  onSelectMonth,
}: HeatmapCalendarProps) {
  const matrix = useMemo(() => buildHeatmapMatrix(), []);
  const gridRef = useRef<HTMLDivElement>(null);
  const [gridGap, setGridGap] = useState(2); // Initial default: 2px

  const months = useMemo(() => {
    return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }, []);

  useEffect(() => {
    const gridElement = gridRef.current;
    if (!gridElement) return;

    const updateGap = debounce(() => {
      // Find the first cell to measure its width
      const firstCell = gridElement.querySelector("[data-cell]") as HTMLElement;
      if (firstCell) {
        const cellWidth = firstCell.getBoundingClientRect().width;
        // Gap = 8% of cell width
        const newGap = Math.max(1, Math.round(cellWidth * 0.08));
        setGridGap(newGap);
      }
    }, 150);

    const resizeObserver = new ResizeObserver(updateGap);
    resizeObserver.observe(gridElement);

    // Initial calculation
    updateGap();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div
        ref={gridRef}
        className="grid min-w-[340px]"
        style={{
          gridTemplateColumns: "78px repeat(12, minmax(18px, 36px))",
          gap: `${gridGap}px`,
        }}
      >
        {/* Month header row */}
        <div className="contents">
          <div className="col-start-1 flex items-center" />
          {months.map((month) => {
            const isCurrent = month === currentMonth;
            const isSelected = month === selectedMonth;
            return (
              <button
                key={month}
                onClick={() => onSelectMonth(month)}
                className={`text-center text-xs font-medium py-1
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
          <div key={row.countryId} className="contents">
            {/* Country label */}
            <div className="text-xs text-ink-muted truncate pr-1 flex items-center">
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
                  data-cell
                  className={`rounded-[3px] transition-all
                    ${STATUS_COLORS[cell.status]}
                    ${
                      cell.status === "harvest_secondary" ||
                      cell.status === "arrival_secondary"
                        ? "stripe-pattern"
                        : ""
                    }
                    ${isSelectedCol ? "ring-1 ring-primary ring-offset-1 ring-offset-canvas" : ""}
                    ${isCurrentCol && !isSelectedCol ? "ring-1 ring-primary/30 ring-offset-1 ring-offset-canvas" : ""}`}
                  style={{
                    aspectRatio: "1 / 1",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
