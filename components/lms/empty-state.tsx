import type { LucideIcon } from "lucide-react";

/** État vide réutilisable (§22.2 — EmptyState). */
export function EmptyState({
  icon: Icon,
  title,
  description,
  badge,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-6 py-20 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50 text-orange-500 dark:bg-orange-500/10">
        <Icon className="h-8 w-8" />
      </span>
      {badge && (
        <span className="mt-5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
          {badge}
        </span>
      )}
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
