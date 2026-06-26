import Link from "next/link";
import { Calendar, Clock, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Actualite } from "@/lib/data";

export function ActualiteCard({ actualite }: { actualite: Actualite }) {
  return (
    <Link
      href={`/actualites/${actualite.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative flex aspect-[16/9] items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500/10 to-green-500/10">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <span className="relative rounded-full bg-[var(--bg-elevated)]/90 px-3 py-1 text-xs font-semibold text-orange-600 shadow-sm backdrop-blur">
          {actualite.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(actualite.date)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {actualite.readingTime} min
          </span>
        </div>
        <h3 className="mt-2.5 text-base font-bold leading-snug transition-colors group-hover:text-orange-600 sm:text-lg">
          {actualite.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          {actualite.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-orange-600">
          Lire l'article
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
