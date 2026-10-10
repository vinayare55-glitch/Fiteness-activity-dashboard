import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Trophy, Flame, Target, Pencil, Check } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { AppShellLoading } from "@/components/Loading";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useWeeklyGoal, useWorkouts } from "@/hooks/use-workouts";
import { caloriesThisWeek, monthlySummaries, weeklySummaries, type PeriodSummary } from "@/lib/stats";
import type { Workout } from "@/lib/api";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — FitTrack" },
      { name: "description", content: "Weekly and monthly summaries, personal bests and your calorie goal." },
      { property: "og:title", content: "Progress — FitTrack" },
      { property: "og:description", content: "Weekly and monthly summaries, personal bests and your calorie goal." },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const { data, isLoading } = useWorkouts();
  const [goal, setGoal] = useWeeklyGoal();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const w = data ?? [];

  const d = useMemo(() => {
    const longest = w.reduce<Workout | null>((b, x) => (!b || x.duration > b.duration ? x : b), null);
    const most = w.reduce<Workout | null>((b, x) => (!b || x.calories > b.calories ? x : b), null);
    return {
      weekly: weeklySummaries(w).reverse(),
      monthly: monthlySummaries(w).reverse(),
      week: caloriesThisWeek(w),
      longest,
      most,
    };
  }, [w]);

  if (isLoading) return <AppShellLoading />;

  const pct = Math.min(100, Math.round((d.week / goal) * 100));
  const saveGoal = () => {
    const v = Number(draft);
    if (!Number.isFinite(v) || v < 100 || v > 50000) {
      toast.error("Goal must be between 100 and 50,000 kcal");
      return;
    }
    setGoal(Math.round(v));
    setEditing(false);
    toast.success("Weekly goal updated");
  };

  return (
    <>
      <PageHeader title="Progress" subtitle="See how far you've come." />

      <section className="rounded-2xl bg-ink p-6 text-ink-foreground md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm opacity-75"><Target className="h-4 w-4 text-accent" /> Weekly calorie goal</p>
            <p className="mt-2 font-display text-4xl font-bold">
              {d.week.toLocaleString()} <span className="text-lg font-medium opacity-60">/ {goal.toLocaleString()} kcal</span>
            </p>
          </div>
          {editing ? (
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); saveGoal(); }}>
              <Input autoFocus type="number" value={draft} onChange={(e) => setDraft(e.target.value)} className="w-32 bg-card text-card-foreground" aria-label="Weekly goal in kcal" />
              <Button type="submit" size="icon" className="bg-accent text-accent-foreground hover:bg-accent/90" aria-label="Save goal"><Check className="h-4 w-4" /></Button>
            </form>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => { setDraft(String(goal)); setEditing(true); }}>
              <Pencil className="h-3.5 w-3.5" /> Edit goal
            </Button>
          )}
        </div>
        <Progress value={pct} className="mt-6 h-3 bg-sidebar-accent [&>div]:bg-accent" />
        <p className="mt-2 text-sm opacity-75">
          {pct >= 100 ? "Goal smashed this week 🎉" : `${pct}% there — ${(goal - d.week).toLocaleString()} kcal to go`}
        </p>
      </section>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Best icon={Trophy} title="Longest workout" w={d.longest} metric={d.longest ? `${d.longest.duration} min` : ""} />
        <Best icon={Flame} title="Most calories" w={d.most} metric={d.most ? `${d.most.calories} kcal` : ""} />
      </div>

      <Tabs defaultValue="weekly" className="mt-6">
        <TabsList>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        <TabsContent value="weekly"><SummaryList rows={d.weekly} /></TabsContent>
        <TabsContent value="monthly"><SummaryList rows={d.monthly} /></TabsContent>
      </Tabs>
    </>
  );
}

function Best({ icon: Icon, title, w, metric }: { icon: typeof Trophy; title: string; w: Workout | null; metric: string }) {
  return (
    <div className="card-elevated flex items-center gap-4 p-5">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-6 w-6" /></span>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-muted-foreground">{title}</p>
        {w ? (
          <>
            <p className="font-display text-2xl font-bold">{metric}</p>
            <p className="truncate text-sm">{w.exercise} · {format(parseISO(w.date), "MMM d")}</p>
          </>
        ) : <p className="text-sm">No workouts yet</p>}
      </div>
      {w && <CategoryBadge category={w.category} />}
    </div>
  );
}

function SummaryList({ rows }: { rows: PeriodSummary[] }) {
  if (!rows.length) return <div className="card-elevated py-12 text-center text-muted-foreground">Nothing logged yet.</div>;
  const max = Math.max(...rows.map((r) => r.calories), 1);
  return (
    <ul className="card-elevated divide-y">
      {rows.map((r) => (
        <li key={r.key} className="grid gap-2 p-4 sm:grid-cols-[180px_1fr_auto] sm:items-center sm:gap-6">
          <p className="font-medium">{r.label}</p>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(r.calories / max) * 100}%` }} />
          </div>
          <div className="flex gap-4 text-sm text-muted-foreground sm:justify-end">
            <span><b className="text-foreground">{r.workouts}</b> workouts</span>
            <span><b className="text-foreground">{r.minutes}</b> min</span>
            <span><b className="text-foreground">{r.calories.toLocaleString()}</b> kcal</span>
          </div>
        </li>
      ))}
    </ul>
  );
}
