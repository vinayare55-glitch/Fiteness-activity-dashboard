import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { Search, Pencil, Trash2, Plus, ArrowUpDown, X } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/AppShell";
import { CategoryBadge } from "@/components/CategoryBadge";
import { WorkoutDialog } from "@/components/WorkoutDialog";
import { AppShellLoading } from "@/components/Loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CATEGORIES, type Workout } from "@/lib/api";
import { useDeleteWorkout, useWorkouts } from "@/hooks/use-workouts";

const SORTS = ["date", "calories", "duration"] as const;
type Sort = (typeof SORTS)[number];

interface WorkoutSearch {
  q?: string | undefined;
  category?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  sort?: Sort | undefined;
  dir?: "asc" | "desc" | undefined;
}

const str = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const Route = createFileRoute("/workouts")({
  validateSearch: (s: Record<string, unknown>): WorkoutSearch => ({
    q: str(s.q),
    category: CATEGORIES.includes(s.category as never) ? (s.category as string) : undefined,
    from: str(s.from),
    to: str(s.to),
    sort: SORTS.includes(s.sort as Sort) ? (s.sort as Sort) : undefined,
    dir: s.dir === "asc" ? "asc" : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Workouts — FitTrack" },
      { name: "description", content: "Search, filter and manage every workout you've logged." },
      { property: "og:title", content: "Workouts — FitTrack" },
      { property: "og:description", content: "Search, filter and manage every workout you've logged." },
    ],
  }),
  component: WorkoutsPage,
});

function WorkoutsPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const set = (patch: Partial<WorkoutSearch>) =>
    navigate({ to: ".", search: (prev) => ({ ...prev, ...patch }), replace: true });

  const { data, isLoading } = useWorkouts();
  const del = useDeleteWorkout();
  const [editing, setEditing] = useState<Workout | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<Workout | null>(null);

  const sort = search.sort ?? "date";
  const dir = search.dir ?? "desc";

  const rows = useMemo(() => {
    const q = (search.q ?? "").toLowerCase();
    const list = (data ?? []).filter(
      (w) =>
        (!q || w.exercise.toLowerCase().includes(q)) &&
        (!search.category || w.category === search.category) &&
        (!search.from || w.date >= search.from) &&
        (!search.to || w.date <= search.to),
    );
    const m = dir === "asc" ? 1 : -1;
    return list.sort((a, b) =>
      sort === "date" ? a.date.localeCompare(b.date) * m : (a[sort] - b[sort]) * m,
    );
  }, [data, search, sort, dir]);

  if (isLoading) return <AppShellLoading />;

  const hasFilters = !!(search.q || search.category || search.from || search.to);
  const openEdit = (w: Workout | null) => { setEditing(w); setDialogOpen(true); };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      toast.success("Workout deleted", { description: toDelete.exercise });
    } catch {
      toast.error("Couldn't delete workout");
    }
    setToDelete(null);
  };

  return (
    <>
      <PageHeader
        title="Workouts"
        subtitle={`${rows.length} of ${data?.length ?? 0} workouts`}
        action={<Button onClick={() => openEdit(null)}><Plus className="h-4 w-4" /> Add workout</Button>}
      />

      <div className="card-elevated mb-4 grid gap-3 p-4 md:grid-cols-[1fr_160px_auto_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search exercise…" value={search.q ?? ""} onChange={(e) => set({ q: e.target.value || undefined })} />
        </div>
        <Select value={search.category ?? "all"} onValueChange={(v) => set({ category: v === "all" ? undefined : v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Input type="date" aria-label="From date" value={search.from ?? ""} onChange={(e) => set({ from: e.target.value || undefined })} />
          <span className="text-muted-foreground">–</span>
          <Input type="date" aria-label="To date" value={search.to ?? ""} onChange={(e) => set({ to: e.target.value || undefined })} />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => set({ sort: v as Sort })}>
            <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="calories">Calories</SelectItem>
              <SelectItem value="duration">Duration</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" aria-label="Toggle sort direction" onClick={() => set({ dir: dir === "asc" ? undefined : "asc" })}>
            <ArrowUpDown className="h-4 w-4" />
          </Button>
          {hasFilters && (
            <Button variant="ghost" size="icon" aria-label="Clear filters" onClick={() => set({ q: undefined, category: undefined, from: undefined, to: undefined })}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card-elevated py-16 text-center text-muted-foreground">No workouts match your filters.</div>
      ) : (
        <>
          <div className="card-elevated hidden overflow-hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exercise</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Calories</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell>
                      <p className="font-medium">{w.exercise}</p>
                      {w.notes && <p className="max-w-xs truncate text-xs text-muted-foreground">{w.notes}</p>}
                    </TableCell>
                    <TableCell><CategoryBadge category={w.category} /></TableCell>
                    <TableCell>{format(parseISO(w.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">{w.duration} min</TableCell>
                    <TableCell className="text-right font-semibold">{w.calories} kcal</TableCell>
                    <TableCell>
                      <RowActions onEdit={() => openEdit(w)} onDelete={() => setToDelete(w)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="grid gap-3 md:hidden">
            {rows.map((w) => (
              <li key={w.id} className="card-elevated p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{w.exercise}</p>
                    <p className="text-xs text-muted-foreground">{format(parseISO(w.date), "EEE, MMM d, yyyy")}</p>
                  </div>
                  <RowActions onEdit={() => openEdit(w)} onDelete={() => setToDelete(w)} />
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <CategoryBadge category={w.category} />
                  <span>{w.duration} min</span>
                  <span className="ml-auto font-semibold">{w.calories} kcal</span>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <WorkoutDialog open={dialogOpen} onOpenChange={setDialogOpen} workout={editing} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this workout?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.exercise}” will be removed permanently. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="icon" aria-label="Edit workout" onClick={onEdit}><Pencil className="h-4 w-4" /></Button>
      <Button variant="ghost" size="icon" aria-label="Delete workout" onClick={onDelete} className="text-destructive hover:text-destructive">
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
