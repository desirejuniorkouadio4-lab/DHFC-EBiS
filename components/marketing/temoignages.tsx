"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TEMOIGNAGES } from "@/lib/data";

/** Carousel de témoignages d'enseignants formés (§9.3). */
export function Temoignages() {
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  function go(next: number) {
    setDir(next > index || (index === TEMOIGNAGES.length - 1 && next === 0) ? 1 : -1);
    setIndex((next + TEMOIGNAGES.length) % TEMOIGNAGES.length);
  }

  const t = TEMOIGNAGES[index];

  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Ils en parlent"
          tone="green"
          title="La parole aux enseignants formés"
          description="Des milliers d'enseignants ont déjà renforcé leurs compétences grâce au dispositif. Voici leurs retours."
        />

        <div className="relative mx-auto mt-10 max-w-3xl sm:mt-14">
          <div className="absolute -left-1 -top-5 text-orange-500/15">
            <Quote className="h-16 w-16 sm:h-24 sm:w-24" />
          </div>

          <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-lg sm:min-h-[260px] sm:p-12">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.blockquote
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="text-balance text-base font-medium leading-relaxed sm:text-xl">
                  « {t.quote} »
                </p>
                <footer className="mt-6 flex items-center gap-3 sm:mt-8 sm:gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 font-display text-sm font-bold text-white">
                    {t.initials}
                  </span>
                  <div>
                    <div className="font-semibold">{t.name}</div>
                    <div className="text-sm text-[var(--text-secondary)]">
                      {t.role} · {t.college}
                    </div>
                  </div>
                </footer>
              </motion.blockquote>
            </AnimatePresence>
          </div>

          {/* Contrôles */}
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Témoignage précédent"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] transition-colors hover:border-orange-400 hover:text-orange-500"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2" role="tablist" aria-label="Sélection du témoignage">
              {TEMOIGNAGES.map((item, i) => (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Témoignage ${i + 1}`}
                  onClick={() => go(i)}
                  className={`h-2 rounded-full transition-all ${
                    i === index ? "w-7 bg-orange-500" : "w-2 bg-neutral-300 hover:bg-neutral-400 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Témoignage suivant"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] transition-colors hover:border-orange-400 hover:text-orange-500"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
