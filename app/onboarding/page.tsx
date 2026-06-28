import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { completeOnboarding } from "./actions";
import { OnboardingSubmit } from "@/components/auth/onboarding-submit";
import { getSessionUser, isProfileComplete } from "@/lib/auth-helpers";
import { roleHomePath } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Bienvenue",
  robots: { index: false, follow: false },
};

const BIVALENCES = ["Maths · TICE", "PC · SVT"];

const inputClass =
  "h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-500 focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-orange-500/20 sm:text-sm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");
  if (isProfileComplete(user)) redirect(roleHomePath(user.role));
  const { error } = await searchParams;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Logo className="mx-auto" />
          <h1 className="mt-6 text-2xl font-bold tracking-tight">
            Bienvenue, {user.firstName} 👋
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Complétez votre profil pour personnaliser votre espace de formation.
          </p>
        </div>

        <form
          action={completeOnboarding}
          className="space-y-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm sm:p-8"
        >
          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Merci de renseigner tous les champs.
            </p>
          )}

          <div className="space-y-1.5">
            <label htmlFor="bivalence" className="text-sm font-medium">
              Bivalence
            </label>
            <select id="bivalence" name="bivalence" required defaultValue="" className={inputClass}>
              <option value="" disabled>
                Sélectionnez votre bivalence
              </option>
              {BIVALENCES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="region" className="text-sm font-medium">
              Région
            </label>
            <input id="region" name="region" required placeholder="Ex. Gôh" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="dren" className="text-sm font-medium">
              DREN
            </label>
            <input id="dren" name="dren" required placeholder="Ex. DREN de Daloa" className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="college" className="text-sm font-medium">
              Collège d'affectation
            </label>
            <input id="college" name="college" required placeholder="Ex. Collège Moderne de Daloa" className={inputClass} />
          </div>

          <OnboardingSubmit />
        </form>
      </div>
    </div>
  );
}
