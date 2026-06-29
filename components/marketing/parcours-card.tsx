import Link from "next/link";
import { Star, Clock, Layers, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";
import { DISCIPLINES, type Parcours } from "@/lib/data";

const LEVEL_TONE: Record<Parcours["level"], string> = {
  Débutant: "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300",
  Intermédiaire: "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300",
  Avancé: "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200",
};

export function ParcoursCard({ parcours }: { parcours: Parcours }) {
  const discipline = DISCIPLINES.find((d) => d.slug === parcours.disciplineSlug);
  const Icon = discipline?.icon;

  return (
    <Link
      href={`/parcours/${parcours.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl focus-visible:-translate-y-1.5"
    >
      {/* Visuel */}
      <div
        className="relative aspect-[16/9] overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${discipline?.color}1a, ${discipline?.color}05)`,
        }}
      >
        {parcours.coverUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={parcours.coverUrl}
              alt={parcours.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-dots opacity-40" />
            {Icon && (
              <Icon
                className="absolute -bottom-4 -right-3 h-32 w-32 opacity-15 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6"
                style={{ color: discipline?.color }}
              />
            )}
          </>
        )}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold backdrop-blur dark:bg-neutral-900/80"
            style={{ color: discipline?.color }}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {discipline?.short}
          </span>
          {parcours.isNew && (
            <span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
              Nouveau
            </span>
          )}
        </div>
        <span
          className={cn(
            "absolute bottom-4 left-4 rounded-full px-2.5 py-1 text-xs font-semibold",
            LEVEL_TONE[parcours.level]
          )}
        >
          {parcours.level}
        </span>
      </div>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-center gap-1 text-sm">
          <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
          <span className="font-semibold">{parcours.rating.toFixed(1)}</span>
          <span className="text-[var(--text-secondary)]">
            ({formatNumber(parcours.reviews)} avis)
          </span>
        </div>

        <h3 className="mt-2.5 line-clamp-2 text-base font-bold leading-snug transition-colors group-hover:text-orange-600 sm:text-lg">
          {parcours.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {parcours.subtitle}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-4 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" /> {parcours.durationHours} h
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5" /> {parcours.modules} mod.
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" /> {formatNumber(parcours.enrolled)}
          </span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-[var(--border-subtle)] pt-3">
          <span className="text-sm font-semibold text-orange-600">Voir le parcours</span>
          <ArrowRight className="h-4 w-4 text-orange-600 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
