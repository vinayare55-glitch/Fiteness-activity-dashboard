import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { LayoutDashboard, Dumbbell, TrendingUp, Plus, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkoutDialog } from "./WorkoutDialog";

const NAV = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/progress", label: "Progress", icon: TrendingUp },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen md:pl-64">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar p-5 text-sidebar-foreground md:flex">
        <Link to="/" className="mb-10 flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
            <Activity className="h-5 w-5" />
          </span>
          <span className="font-display text-xl font-bold text-sidebar-accent-foreground">FitTrack</span>
        </Link>
        <nav className="grid gap-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent"
              activeProps={{ className: "bg-sidebar-accent text-sidebar-primary" }}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>
        <Button onClick={() => setOpen(true)} className="mt-auto bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
          <Plus className="h-4 w-4" /> Log workout
        </Button>
      </aside>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b bg-background/85 px-4 py-3 backdrop-blur md:hidden">
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-accent"><Activity className="h-4 w-4" /></span>
          FitTrack
        </Link>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Log</Button>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 md:px-8 md:pb-12 md:pt-10">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t bg-card md:hidden">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            activeOptions={{ exact: true }}
            className="flex flex-col items-center gap-1 py-2.5 text-xs text-muted-foreground"
            activeProps={{ className: "text-primary font-semibold" }}
          >
            <Icon className="h-5 w-5" />
            {label}
          </Link>
        ))}
      </nav>

      <WorkoutDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-muted-foreground">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
