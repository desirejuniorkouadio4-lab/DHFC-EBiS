import type { LucideIcon } from "lucide-react";
import { Hammer } from "lucide-react";

type Feature = { icon: LucideIcon; title: string; desc: string };

/** Page d'accueil d'un espace personnel (placeholder structuré des fonctionnalités à venir). */
export function RoleSpace({
  icon: Icon,
  title,
  intro,
  features,
}: {
  icon: LucideIcon;
  title: string;
  intro: string;
  features: Feature[];
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <Icon className="h-8 w-8" />
        </span>
        <div>
          <div className="mb-1.5 inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
            <Hammer className="h-3.5 w-3.5" />
            En construction
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
          <p className="mt-1 max-w-xl text-[var(--text-secondary)]">{intro}</p>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <article
            key={f.title}
            className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
              <f.icon className="h-5 w-5" />
            </span>
            <h2 className="mt-4 font-bold">{f.title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">{f.desc}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
