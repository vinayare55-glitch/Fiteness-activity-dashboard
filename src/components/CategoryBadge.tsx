import type { Category } from "@/lib/api";
import { CATEGORY_COLORS } from "@/lib/stats";

export function CategoryBadge({ category }: { category: Category }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `color-mix(in oklab, ${color} 16%, transparent)`, color: `color-mix(in oklab, ${color} 80%, var(--foreground))` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {category}
    </span>
  );
}
