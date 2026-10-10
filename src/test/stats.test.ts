import { describe, it, expect } from "vitest";
import { computeStreak } from "@/lib/stats";
import type { Workout } from "@/lib/api";

const mk = (date: string): Workout => ({ id: date, exercise: "x", category: "Cardio", duration: 10, calories: 10, date });
const today = new Date(2026, 9, 10);

describe("computeStreak", () => {
  it("counts consecutive days ending today", () => {
    expect(computeStreak([mk("2026-10-10"), mk("2026-10-09"), mk("2026-10-08"), mk("2026-10-06")], today)).toBe(3);
  });
  it("still counts when the last workout was yesterday", () => {
    expect(computeStreak([mk("2026-10-09"), mk("2026-10-08")], today)).toBe(2);
  });
  it("is zero when nothing since yesterday", () => {
    expect(computeStreak([mk("2026-10-07")], today)).toBe(0);
  });
});
