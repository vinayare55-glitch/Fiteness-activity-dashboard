import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { Flame, Timer, Dumbbell, Zap, ArrowRight } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShellLoading } from "@/components/Loading";
import { PageHeader } from "@/components/AppShell";
import { CategoryBadge } from "@/components/CategoryBadge";
import { useWorkouts } from "@/hooks/use-workouts";
import { byCategory, caloriesPerDay, computeStreak, weeklySummaries } from "@/lib/stats";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — FitTrack" },
      { name: "description", content: "Your workouts, minutes, calories and streak at a glance." },
      { property: "og:title", content: "Dashboard — FitTrack" },
      { property: "og:description", content: "Your workouts, minutes, calories and streak at a glance." },
    ],
  }),
  component: Dashboard,
});

const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
};

function Dashboard() {
  const { data, isLoading } = useWorkouts();
  const w = data ?? [];
  const s = useMemo(
    () => ({
      minutes: w.reduce((a, x) => a + x.duration, 0),
      calories: w.reduce((a, x) => a + x.calories, 0),
      streak: computeStreak(w),
      daily: caloriesPerDay(w, 14),
      weekly: weeklySummaries(w).slice(-6),
      cats: byCategory(w),
    }),
    [w],
  );
  if (isLoading) return <AppShellLoading />;

  const stats = [
    { label: "Total workouts", value: w.length, icon: Dumbbell, unit: "" },
    { label: "Total minutes", value: s.minutes.toLocaleString(), icon: Timer, unit: "min" },
    { label: "Calories burned", value: s.calories.toLocaleString(), icon: Flame, unit: "kcal" },
    { label: "Current streak", value: s.streak, icon: Zap, unit: s.streak === 1 ? "day" : "days", highlight: true },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle={format(new Date(), "EEEE, MMMM d")} />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, unit, highlight }) => (
          <div key={label} className={highlight ? "rounded-2xl bg-ink p-5 text-ink-foreground" : "card-elevated p-5"}>
            <div className="flex items-center justify-between">
              <span className={highlight ? "text-sm opacity-75" : "text-sm text-muted-foreground"}>{label}</span>
              <Icon className={highlight ? "h-4 w-4 text-accent" : "h-4 w-4 text-primary"} />
            </div>
            <p className="mt-3 font-display text-3xl font-bold">
              {value} <span className="text-sm font-medium opacity-60">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="card-elevated p-5 lg:col-span-2">
          <h2 className="font-semibold">Calories per day</h2>
          <p className="text-sm text-muted-foreground">Last 14 days</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer>
              <AreaChart data={s.daily} margin={{ left: -16, right: 8 }}>
                <defs>
                  <linearGradient id="cal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} interval={1} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kcal`, "Calories"]} />
                <Area type="monotone" dataKey="calories" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#cal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-elevated p-5">
          <h2 className="font-semibold">By category</h2>
          <p className="text-sm text-muted-foreground">{w.length} workouts</p>
          <div className="mt-2 h-44">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={s.cats} dataKey="value" nameKey="name" innerRadius={48} outerRadius={75} paddingAngle={3} stroke="none">
                  {s.cats.map((c) => <Cell key={c.name} fill={c.fill} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
            {s.cats.map((c) => (
              <li key={c.name} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.fill }} />
                {c.name} <span className="ml-auto text-muted-foreground">{c.value}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card-elevated p-5">
          <h2 className="font-semibold">Minutes per week</h2>
          <p className="text-sm text-muted-foreground">Recent weeks</p>
          <div className="mt-4 h-56">
            <ResponsiveContainer>
              <BarChart data={s.weekly} margin={{ left: -20 }}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickFormatter={(l: string) => l.replace("Wk of ", "")} tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "var(--muted)" }} formatter={(v) => [`${v} min`, "Minutes"]} />
                <Bar dataKey="minutes" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="card-elevated p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Recent workouts</h2>
            <Link to="/workouts" className="flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {w.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No workouts yet — log your first one!</p>
          ) : (
            <ul className="mt-3 divide-y">
              {w.slice(0, 5).map((x) => (
                <li key={x.id} className="flex items-center gap-3 py-3">
                  <CategoryBadge category={x.category} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{x.exercise}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(x.date), "EEE, MMM d")}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold">{x.calories} kcal</p>
                    <p className="text-xs text-muted-foreground">{x.duration} min</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
