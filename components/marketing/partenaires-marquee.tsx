"use client";

import { useEffect, useRef, useState } from "react";

type Partenaire = { acronym: string; name: string; role: string };

/**
 * Carrousel de partenaires en défilement continu (marquee).
 * - Auto-défile à vitesse constante en se mettant en pause au survol/focus.
 * - Sur mobile (snap-x), reste un carrousel manuel (pas d'autoplay).
 */
export function PartenairesMarquee({ partenaires }: { partenaires: Partenaire[] }) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  // Dupliqué pour la boucle infinie sans saut visible.
  const items = [...partenaires, ...partenaires];

  // Vitesse : ~20s pour parcourir 1 cycle (constante visuelle).
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    let last = performance.now();
    const SPEED = 30; // px/s
    function tick(t: number) {
      const dt = (t - last) / 1000;
      last = t;
      if (!paused) {
        const half = track!.scrollWidth / 2;
        const next = (parseFloat(track!.dataset.offset || "0") + dt * SPEED) % half;
        track!.dataset.offset = String(next);
        track!.style.transform = `translateX(${-next}px)`;
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <div
      className="relative mt-14 overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      {/* Voilage latéral pour l'effet « infinite » */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--bg-secondary)] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--bg-secondary)] to-transparent" />

      <div ref={trackRef} className="flex gap-4 will-change-transform" data-offset="0" aria-hidden={false}>
        {items.map((p, i) => (
          <div key={`${p.acronym}-${i}`} className="w-[42%] shrink-0 sm:w-[30%] lg:w-[14%]">
            <div
              title={p.name}
              className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
            >
              <span className="font-display text-xl font-extrabold tracking-tight text-neutral-400 transition-colors group-hover:text-orange-600">
                {p.acronym}
              </span>
              <span className="text-[11px] leading-tight text-[var(--text-secondary)]">{p.role}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
