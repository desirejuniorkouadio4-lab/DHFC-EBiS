"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { ExternalLink, LogOut } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { roleLabel } from "@/lib/rbac";

/** Coque commune des espaces personnel (tuteur, encadreur, concepteur, admin). */
export function StaffShell({
  role,
  name,
  initials,
  children,
}: {
  role: string;
  name: string;
  initials: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Accueil DHFC-EBiS">
              <Logo />
            </Link>
            <span className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 sm:inline-block dark:bg-orange-500/10 dark:text-orange-300">
              Espace {roleLabel(role).toLowerCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="hidden h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600 sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" /> Site
            </Link>
            <ThemeToggle />
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/connexion" })}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium transition-colors hover:border-red-300 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </button>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white">
              {initials}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}
