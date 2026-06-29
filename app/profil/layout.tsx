import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, UserCog } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { roleHomePath, roleLabel } from "@/lib/rbac";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export const metadata: Metadata = {
  title: "Mon profil",
  robots: { index: false, follow: false },
};

/** Profil & paramètres — accessible à tout utilisateur connecté (tous rôles). */
export default async function ProfilLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" aria-label="Accueil DHFC-EBiS">
              <Logo />
            </Link>
            <span className="hidden items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 sm:inline-flex dark:bg-orange-500/10 dark:text-orange-300">
              <UserCog className="h-3.5 w-3.5" /> Mon profil
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={roleHomePath(user.role)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
            >
              <ArrowLeft className="h-4 w-4" /> Mon espace
            </Link>
            <ThemeToggle />
            <span className="hidden rounded-full bg-[var(--bg-secondary)] px-3 py-1.5 text-xs font-semibold text-[var(--text-secondary)] sm:inline-block">
              {roleLabel(user.role)}
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
    </div>
  );
}
