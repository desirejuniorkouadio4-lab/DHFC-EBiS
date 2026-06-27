import { Download, ShieldCheck, QrCode, Award, Clock } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { ProgressBar } from "@/components/lms/progress-bar";
import { ENROLLMENTS } from "@/lib/lms/data";
import { PARCOURS } from "@/lib/data";
import { getSessionUser } from "@/lib/auth-helpers";
import { formatDate } from "@/lib/utils";

// Certificat obtenu (mock). En cible : généré à la complétion (cf. §18.1).
const EARNED = {
  slug: "vivant-environnement-svt",
  code: "DHFC-2026-SVT-7F3A9C",
  issuedAt: "2026-06-12",
  score: 86,
};

export default async function CertificatsPage() {
  const CURRENT_USER = await getSessionUser();
  if (!CURRENT_USER) return null;
  const parcours = PARCOURS.find((p) => p.slug === EARNED.slug);
  const inProgress = ENROLLMENTS.filter((e) => e.slug !== EARNED.slug);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
          <Award className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes certificats</h1>
          <p className="text-[var(--text-secondary)]">
            Vos attestations de réussite, signées par la DPFC.
          </p>
        </div>
      </div>

      {/* Certificat obtenu */}
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="relative overflow-hidden rounded-3xl border-2 border-orange-200 bg-[var(--bg-elevated)] p-8 dark:border-orange-500/30">
          <div className="pointer-events-none absolute inset-0 opacity-[0.04]">
            <LogoMark className="absolute left-1/2 top-1/2 h-72 w-auto -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative text-center">
            <div className="flex items-center justify-center gap-3">
              <LogoMark className="h-12 w-auto" />
            </div>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              République de Côte d'Ivoire · MENAET — DPFC
            </p>
            <p className="mt-6 text-sm text-[var(--text-secondary)]">Certifie que</p>
            <p className="font-display text-2xl font-extrabold sm:text-3xl">
              {CURRENT_USER.firstName} {CURRENT_USER.lastName}
            </p>
            <p className="mt-4 text-sm text-[var(--text-secondary)]">a suivi avec succès le parcours</p>
            <p className="mt-1 text-lg font-bold text-orange-600">{parcours?.title}</p>

            <div className="mx-auto mt-6 flex max-w-md items-center justify-between border-t border-[var(--border-subtle)] pt-5 text-left text-xs text-[var(--text-secondary)]">
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Délivré le</p>
                <p>{formatDate(EARNED.issuedAt)}</p>
              </div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">Score final</p>
                <p>{EARNED.score} %</p>
              </div>
              <div className="flex flex-col items-center">
                <QrCode className="h-9 w-9 text-[var(--text-primary)]" />
                <p className="mt-1 font-mono text-[10px]">{EARNED.code}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600">
            <Download className="h-5 w-5" /> Télécharger le PDF
          </button>
          <a
            href={`/verifier/${EARNED.code}`}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[var(--border-subtle)] font-semibold transition-colors hover:border-orange-400"
          >
            <ShieldCheck className="h-5 w-5 text-green-500" /> Vérifier l'authenticité
          </a>
          <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-sm text-[var(--text-secondary)]">
            <p className="font-semibold text-[var(--text-primary)]">Vérification publique</p>
            <p className="mt-1">
              Chaque certificat possède un code unique vérifiable par toute personne, sans
              authentification.
            </p>
          </div>
        </div>
      </div>

      {/* En cours */}
      <section>
        <h2 className="mb-5 text-xl font-bold">Certificats à débloquer</h2>
        <div className="space-y-3">
          {inProgress.map((e) => {
            const p = PARCOURS.find((x) => x.slug === e.slug);
            return (
              <div
                key={e.slug}
                className="flex flex-col gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5 sm:flex-row sm:items-center"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--bg-secondary)] text-neutral-400">
                  <Clock className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p?.title}</p>
                  <p className="text-xs text-[var(--text-secondary)]">
                    Terminez le parcours pour débloquer votre certificat.
                  </p>
                  <div className="mt-2 max-w-md">
                    <ProgressBar value={e.baselineProgress} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-orange-600">{e.baselineProgress} %</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
