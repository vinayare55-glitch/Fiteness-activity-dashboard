import { startOfWeek, startOfMonth, format, subDays, parseISO } from "date-fns";
import { toISODate, type Workout, type Category } from "./api";

export const CATEGORY_COLORS: Record<Category, string> = {
  Cardio: "var(--chart-1)",
  Strength: "var(--chart-2)",
  Yoga: "var(--chart-3)",
  HIIT: "var(--chart-5)",
  Walking: "var(--chart-4)",
  Cycling: "var(--chart-6)",
  Other: "var(--chart-7)",
};

/** Consecutive days with at least one workout, ending today (or yesterday if none today yet). */
export function computeStreak(workouts: Workout[], today = new Date()): number {
  const days = new Set(workouts.map((w) => w.date));
  let cursor = today;
  if (!days.has(toISODate(cursor))) cursor = subDays(cursor, 1);
  let streak = 0;
  while (days.has(toISODate(cursor))) {
    streak++;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export function caloriesPerDay(workouts: Workout[], days = 14, today = new Date()) {
  return Array.from({ length: days }, (_, i) => {
    const d = subDays(today, days - 1 - i);
    const iso = toISODate(d);
    const calories = workouts.filter((w) => w.date === iso).reduce((s, w) => s + w.calories, 0);
    return { date: format(d, "MMM d"), calories };
  });
}

export interface PeriodSummary {
  key: string;
  label: string;
  workouts: number;
  minutes: number;
  calories: number;
}

function summarize(workouts: Workout[], keyFn: (d: Date) => Date, labelFn: (d: Date) => string) {
  const map = new Map<string, PeriodSummary>();
  for (const w of workouts) {
    const start = keyFn(parseISO(w.date));
    const key = toISODate(start);
    const cur = map.get(key) ?? { key, label: labelFn(start), workouts: 0, minutes: 0, calories: 0 };
    cur.workouts++;
    cur.minutes += w.duration;
    cur.calories += w.calories;
    map.set(key, cur);
  }
  return [...map.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export const weeklySummaries = (w: Workout[]) =>
  summarize(w, (d) => startOfWeek(d, { weekStartsOn: 1 }), (d) => `Wk of ${format(d, "MMM d")}`);

export const monthlySummaries = (w: Workout[]) =>
  summarize(w, (d) => startOfMonth(d), (d) => format(d, "MMMM yyyy"));

export function caloriesThisWeek(workouts: Workout[], today = new Date()) {
  const start = toISODate(startOfWeek(today, { weekStartsOn: 1 }));
  const end = toISODate(today);
  return workouts.filter((w) => w.date >= start && w.date <= end).reduce((s, w) => s + w.calories, 0);
}

export function byCategory(workouts: Workout[]) {
  const map = new Map<Category, number>();
  workouts.forEach((w) => map.set(w.category, (map.get(w.category) ?? 0) + 1));
  return [...map.entries()].map(([name, value]) => ({ name, value, fill: CATEGORY_COLORS[name] }));
}
