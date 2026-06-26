import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-50" />
        <div className="absolute left-1/2 top-1/3 h-72 w-72 -translate-x-1/2 rounded-full bg-orange-400/20 blur-3xl" />
      </div>

      <Link href="/" className="absolute left-6 top-6">
        <Logo />
      </Link>

      <LogoMark className="h-16 w-auto opacity-90" />
      <p className="mt-8 font-display text-7xl font-extrabold tracking-tight text-orange-500 sm:text-8xl">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold sm:text-3xl">Page introuvable</h1>
      <p className="mt-3 max-w-md text-[var(--text-secondary)]">
        La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez
        l'adresse ou revenez à l'accueil.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600"
        >
          <Home className="h-4 w-4" />
          Retour à l'accueil
        </Link>
        <Link
          href="/parcours"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] px-6 font-semibold transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          <Search className="h-4 w-4" />
          Voir les parcours
        </Link>
      </div>
    </div>
  );
}
