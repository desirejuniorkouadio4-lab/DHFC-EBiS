import { cn } from "@/lib/utils";

/** Conteneur typographique pour les contenus longs (pages légales, articles). */
export function Prose({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "max-w-none space-y-6 leading-relaxed text-[var(--text-secondary)]",
        "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-[var(--text-primary)] sm:[&_h2]:text-2xl",
        "[&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-[var(--text-primary)]",
        "[&_p]:text-[15px]",
        "[&_a]:font-medium [&_a]:text-orange-600 hover:[&_a]:underline",
        "[&_ul]:space-y-2 [&_ul]:pl-1 [&_li]:flex [&_li]:gap-3 [&_li]:text-[15px]",
        "[&_strong]:font-semibold [&_strong]:text-[var(--text-primary)]",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Élément de liste avec puce orange, pour les contenus Prose. */
export function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
      <span>{children}</span>
    </li>
  );
}
