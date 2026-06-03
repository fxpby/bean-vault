import calendarData from '../info/coffee_harvest_calendar_12month_recommendations.json';

export type CellStatus = 'harvest_primary' | 'harvest_secondary' | 'arrival_primary' | 'arrival_secondary' | 'none';

export interface HeatmapCell {
  countryId: string;
  countryName: string;
  flag: string;
  month: number;
  status: CellStatus;
}

export interface HeatmapRow {
  countryId: string;
  countryName: string;
  flag: string;
  cells: HeatmapCell[];
}

export interface RecommendationCard {
  rank: number;
  countryId: string;
  country: string;
  flag: string;
  basisFromChart: string;
  reason: string;
  flavor: string;
  flavorTags: string[];
  processNotes: string[];
  recommendedBrewing: string[];
  appPositioning: string;
}

const countries = calendarData.countries;
const monthlyStatusIndex = calendarData.monthly_status_index;

/**
 * Build the heatmap matrix: 13 rows (countries) x 12 columns (months).
 * Each cell has a status derived from monthly_status_index.
 */
export function buildHeatmapMatrix(): HeatmapRow[] {
  const statusByMonthAndCountry: Record<number, Record<string, CellStatus>> = {};

  for (const entry of monthlyStatusIndex) {
    const month = entry.month;
    statusByMonthAndCountry[month] = {};

    for (const id of entry.harvest_primary) {
      statusByMonthAndCountry[month][id] = 'harvest_primary';
    }
    for (const id of entry.harvest_secondary) {
      statusByMonthAndCountry[month][id] = 'harvest_secondary';
    }
    for (const id of entry.arrival_primary) {
      statusByMonthAndCountry[month][id] = 'arrival_primary';
    }
    for (const id of entry.arrival_secondary) {
      statusByMonthAndCountry[month][id] = 'arrival_secondary';
    }
  }

  return countries.map((country) => ({
    countryId: country.id,
    countryName: country.name_zh,
    flag: country.flag,
    cells: calendarData.months.map((month) => ({
      countryId: country.id,
      countryName: country.name_zh,
      flag: country.flag,
      month: month.num,
      status: statusByMonthAndCountry[month.num]?.[country.id] ?? 'none',
    })),
  }));
}

/**
 * Get recommendation cards for a specific month.
 * Priority order: arrival_primary > arrival_secondary > harvest_primary > harvest_secondary
 */
export function getRecommendationsForMonth(month: number): RecommendationCard[] {
  const monthData = calendarData.monthly_recommendations.find((m) => m.month === month);
  if (!monthData) return [];
  return monthData.cards.map((card) => ({
    rank: card.rank,
    countryId: card.country_id,
    country: card.country,
    flag: card.flag,
    basisFromChart: card.basis_from_chart,
    reason: card.reason,
    flavor: card.flavor,
    flavorTags: card.flavor_tags,
    processNotes: card.process_notes,
    recommendedBrewing: card.recommended_brewing,
    appPositioning: card.app_positioning,
  }));
}

/**
 * Get the current month number (1-12).
 */
export function getCurrentMonth(): number {
  return new Date().getMonth() + 1;
}

/**
 * Get month label in Chinese.
 */
export function getMonthLabel(month: number): string {
  const monthData = calendarData.months.find((m) => m.num === month);
  return monthData?.zh ?? `${month}月`;
}