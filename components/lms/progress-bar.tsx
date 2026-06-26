import { cn } from "@/lib/utils";

/** Barre de progression (orange) avec transition douce. */
export function ProgressBar({
  value,
  className,
  tone = "orange",
}: {
  value: number;
  className?: string;
  tone?: "orange" | "green";
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      className={cn("h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-[var(--ease-smooth)]",
          tone === "orange"
            ? "bg-gradient-to-r from-orange-400 to-orange-500"
            : "bg-gradient-to-r from-green-400 to-green-500"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
