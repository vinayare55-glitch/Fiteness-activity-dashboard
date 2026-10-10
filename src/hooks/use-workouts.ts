import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  createWorkout,
  deleteWorkout,
  getWorkouts,
  updateWorkout,
  type WorkoutInput,
} from "@/lib/api";

export const workoutsKey = ["workouts"] as const;

export function useWorkouts() {
  return useQuery({ queryKey: workoutsKey, queryFn: getWorkouts, ssr: false } as never as {
    queryKey: typeof workoutsKey;
    queryFn: typeof getWorkouts;
  });
}

export function useSaveWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: string; data: WorkoutInput }) =>
      id ? updateWorkout(id, data) : createWorkout(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: workoutsKey }),
  });
}

export function useDeleteWorkout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteWorkout(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: workoutsKey }),
  });
}

const GOAL_KEY = "fittrack.weeklyGoal";
export const DEFAULT_WEEKLY_GOAL = 2500;

export function useWeeklyGoal() {
  const [goal, setGoal] = useState(DEFAULT_WEEKLY_GOAL);
  useEffect(() => {
    const v = Number(window.localStorage.getItem(GOAL_KEY));
    if (v > 0) setGoal(v);
  }, []);
  const save = (v: number) => {
    setGoal(v);
    window.localStorage.setItem(GOAL_KEY, String(v));
  };
  return [goal, save] as const;
}
