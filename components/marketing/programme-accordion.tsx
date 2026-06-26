"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, PlayCircle, FileText, CheckCircle2 } from "lucide-react";

export type ProgrammeModule = {
  title: string;
  lessons: { title: string; type: "video" | "texte" | "quiz"; duration: string }[];
};

const TYPE_ICON = {
  video: PlayCircle,
  texte: FileText,
  quiz: CheckCircle2,
} as const;

/** Programme détaillé d'un parcours en accordéon (§11.3). */
export function ProgrammeAccordion({ modules }: { modules: ProgrammeModule[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
      {modules.map((mod, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className="bg-[var(--bg-elevated)]">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--bg-secondary)]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-orange-600 dark:bg-orange-500/10">
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold">{mod.title}</span>
                  <span className="ml-2 text-sm text-[var(--text-secondary)]">
                    {mod.lessons.length} leçons
                  </span>
                </span>
              </span>
              <ChevronDown
                className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <ul className="space-y-1 px-5 pb-4">
                    {mod.lessons.map((lesson, j) => {
                      const Icon = TYPE_ICON[lesson.type];
                      return (
                        <li
                          key={j}
                          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-[var(--bg-secondary)]"
                        >
                          <span className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-orange-500" />
                            {lesson.title}
                          </span>
                          <span className="shrink-0 text-xs text-[var(--text-secondary)]">
                            {lesson.duration}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
