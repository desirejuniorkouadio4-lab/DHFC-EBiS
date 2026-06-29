"use client";

import { useEffect, useState } from "react";
import type { Point } from "@/lib/admin/analytics";
import { cn } from "@/lib/utils";

/** Déclenche l'animation au montage (transitions CSS inline, fiables). */
function useReveal() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setShown(true), 60);
    return () => clearTimeout(id);
  }, []);
  return shown;
}

/** Histogramme vertical animé (barres montant de 0 à leur valeur). */
export function VerticalBars({ points }: { points: Point[] }) {
  const shown = useReveal();
  const max = Math.max(1, ...points.map((p) => p.value));
  return (
    <div className="mt-6 flex h-44 items-end gap-2">
      {points.map((p, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <span
            className={cn("text-xs font-semibold text-[var(--text-secondary)] transition-opacity duration-300", shown ? "opacity-100" : "opacity-0")}
            style={{ transitionDelay: `${i * 60 + 350}ms` }}
          >
            {p.value}
          </span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-orange-500 to-green-500"
              style={{
                height: shown ? `${Math.max(3, (p.value / max) * 100)}%` : "3%",
                transition: "height 0.6s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 60}ms`,
              }}
              title={`${p.label} : ${p.value}`}
            />
          </div>
          <span className="text-[10px] text-[var(--text-secondary)]">{p.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Barres horizontales animées (largeur s'étirant de 0 à la valeur). */
export function HorizontalBars({ points, suffix = "", max }: { points: Point[]; suffix?: string; max?: number }) {
  const shown = useReveal();
  const top = max ?? Math.max(1, ...points.map((p) => p.value));
  if (points.length === 0) {
    return <p className="mt-4 text-sm text-[var(--text-secondary)]">Aucune donnée.</p>;
  }
  return (
    <ul className="mt-4 space-y-3">
      {points.map((p, i) => (
        <li key={i}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="min-w-0 truncate font-medium">{p.label}</span>
            <span className="shrink-0 font-semibold text-orange-600">
              {p.value}
              {suffix}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500"
              style={{
                width: shown ? `${Math.max(2, (p.value / top) * 100)}%` : "2%",
                transition: "width 0.7s cubic-bezier(0.22,1,0.36,1)",
                transitionDelay: `${i * 70}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
