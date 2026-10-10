import { Skeleton } from "@/components/ui/skeleton";

export function AppShellLoading() {
  return (
    <div className="grid gap-4">
      <Skeleton className="h-10 w-48" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-72 rounded-2xl" />
    </div>
  );
}
