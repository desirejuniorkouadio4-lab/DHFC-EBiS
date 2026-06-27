"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ParcoursCard } from "./parcours-card";
import { DISCIPLINES, type Parcours } from "@/lib/data";

const LEVELS = ["Débutant", "Intermédiaire", "Avancé"] as const;

/** Catalogue filtrable des parcours (§11.2). */
export function ParcoursCatalogue({ parcours }: { parcours: Parcours[] }) {
  const [query, setQuery] = useState("");
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);

  const results = useMemo(() => {
    return parcours.filter((p) => {
      const matchQuery =
        !query ||
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.subtitle.toLowerCase().includes(query.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()));
      const matchDiscipline = !discipline || p.disciplineSlug === discipline;
      const matchLevel = !level || p.level === level;
      return matchQuery && matchDiscipline && matchLevel;
    });
  }, [parcours, query, discipline, level]);

  const hasFilters = query || discipline || level;

  return (
    <section className="py-14 sm:py-20">
      <Container>
        {/* Barre de filtres */}
        <div className="sticky top-20 z-30 mb-10 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/90 p-4 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un parcours, un thème, une compétence…"
                className="h-11 w-full rounded-full border border-neutral-300 bg-[var(--bg-primary)] pl-11 pr-4 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <SlidersHorizontal className="hidden h-4 w-4 shrink-0 text-neutral-400 sm:block" />
              <FilterChip active={!discipline} onClick={() => setDiscipline(null)}>
                Toutes disciplines
              </FilterChip>
              {DISCIPLINES.map((d) => (
                <FilterChip
                  key={d.slug}
                  active={discipline === d.slug}
                  onClick={() => setDiscipline(discipline === d.slug ? null : d.slug)}
                >
                  {d.short}
                </FilterChip>
              ))}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              Niveau :
            </span>
            {LEVELS.map((l) => (
              <FilterChip key={l} active={level === l} onClick={() => setLevel(level === l ? null : l)}>
                {l}
              </FilterChip>
            ))}
            {hasFilters && (
              <button
                onClick={() => {
                  setQuery("");
                  setDiscipline(null);
                  setLevel(null);
                }}
                className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700"
              >
                <X className="h-3.5 w-3.5" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>

        {/* Résultats */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-[var(--text-secondary)]">
            <span className="font-semibold text-[var(--text-primary)]">{results.length}</span>{" "}
            parcours {hasFilters ? "correspondant·s" : "disponibles"}
          </p>
        </div>

        {results.length > 0 ? (
          <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {results.map((p) => (
                <motion.div
                  key={p.slug}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.25 }}
                >
                  <ParcoursCard parcours={p} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-[var(--border-subtle)] py-20 text-center">
            <Search className="h-10 w-10 text-neutral-300" />
            <p className="font-semibold">Aucun parcours ne correspond à votre recherche</p>
            <p className="text-sm text-[var(--text-secondary)]">
              Essayez d'élargir vos critères ou de réinitialiser les filtres.
            </p>
          </div>
        )}
      </Container>
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
        active
          ? "bg-orange-500 text-white"
          : "border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-orange-300 hover:text-orange-600"
      }`}
    >
      {children}
    </button>
  );
}
