/**
 * FitTrack data layer.
 *
 * Every function below is async and currently backed by localStorage.
 * To move to a real backend, swap each body for a fetch() against a REST API:
 *   getWorkouts()          -> GET    `${API_BASE_URL}/api/workouts`
 *   getWorkout(id)         -> GET    `${API_BASE_URL}/api/workouts/:id`
 *   createWorkout(data)    -> POST   `${API_BASE_URL}/api/workouts`
 *   updateWorkout(id,data) -> PUT    `${API_BASE_URL}/api/workouts/:id`
 *   deleteWorkout(id)      -> DELETE `${API_BASE_URL}/api/workouts/:id`
 * The signatures stay the same, so React Query hooks need no changes.
 */
export const API_BASE_URL = "";

export const CATEGORIES = ["Cardio", "Strength", "Yoga", "HIIT", "Walking", "Cycling", "Other"] as const;
export type Category = (typeof CATEGORIES)[number];

export interface Workout {
  id: string;
  exercise: string;
  category: Category;
  duration: number; // minutes
  date: string; // YYYY-MM-DD
  calories: number;
  notes?: string;
}

export type WorkoutInput = Omit<Workout, "id">;

const STORAGE_KEY = "fittrack.workouts";

function isoDaysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISODate(d);
}

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function seed(): Workout[] {
  const rows: [number, string, Category, number, number, string?][] = [
    [0, "Morning run", "Cardio", 35, 380, "Easy pace along the river"],
    [1, "Upper body push", "Strength", 50, 320, "Bench 3x8, OHP 3x10"],
    [2, "Vinyasa flow", "Yoga", 45, 180],
    [4, "Tabata intervals", "HIIT", 25, 340, "8 rounds, felt strong"],
    [5, "Evening walk", "Walking", 40, 170],
    [7, "Road ride", "Cycling", 75, 640, "Hilly route, 32 km"],
    [9, "Leg day", "Strength", 55, 410, "Squats PR at 100 kg"],
    [12, "Tempo run", "Cardio", 40, 450],
    [15, "Rowing machine", "Other", 30, 290],
    [19, "Hatha yoga", "Yoga", 60, 210, "Focus on hips"],
    [23, "Circuit training", "HIIT", 35, 420],
    [28, "Commute ride", "Cycling", 45, 380],
  ];
  return rows.map(([ago, exercise, category, duration, calories, notes], i) => ({
    id: `seed-${i + 1}`,
    exercise,
    category,
    duration,
    calories,
    date: isoDaysAgo(ago),
    ...(notes ? { notes } : {}),
  }));
}

function read(): Workout[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const s = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
    return s;
  }
  try {
    return JSON.parse(raw) as Workout[];
  } catch {
    return [];
  }
}

function write(list: Workout[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

const delay = () => new Promise((r) => setTimeout(r, 120));

export async function getWorkouts(): Promise<Workout[]> {
  await delay();
  return read().sort((a, b) => b.date.localeCompare(a.date));
}

export async function getWorkout(id: string): Promise<Workout> {
  await delay();
  const w = read().find((x) => x.id === id);
  if (!w) throw new Error("Workout not found");
  return w;
}

export async function createWorkout(data: WorkoutInput): Promise<Workout> {
  await delay();
  const w: Workout = { ...data, id: crypto.randomUUID() };
  write([...read(), w]);
  return w;
}

export async function updateWorkout(id: string, data: WorkoutInput): Promise<Workout> {
  await delay();
  const list = read();
  const idx = list.findIndex((x) => x.id === id);
  if (idx === -1) throw new Error("Workout not found");
  list[idx] = { ...data, id };
  write(list);
  return list[idx];
}

export async function deleteWorkout(id: string): Promise<void> {
  await delay();
  write(read().filter((x) => x.id !== id));
}
