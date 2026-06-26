import type { Metadata } from "next";
import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";

export const metadata: Metadata = {
  title: "Vérification de certificat",
  robots: { index: false, follow: false },
};

/** Page publique de vérification d'un certificat (§18.1) — sans authentification. */
export default async function VerifierPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute left-1/2 top-1/4 h-64 w-64 -translate-x-1/2 rounded-full bg-green-400/20 blur-3xl" />
      </div>

      <Link href="/" className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" /> Accueil
      </Link>

      <div className="w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-8 text-center shadow-xl">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-green-600 dark:bg-green-500/10">
          <ShieldCheck className="h-8 w-8" />
        </span>
        <h1 className="mt-5 text-2xl font-bold">Certificat authentique</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Ce certificat a bien été délivré par la DPFC dans le cadre du dispositif DHFC-EBiS.
        </p>

        <dl className="mt-6 space-y-3 rounded-2xl bg-[var(--bg-secondary)] p-5 text-left text-sm">
          <Row label="Code de vérification" value={<span className="font-mono">{code}</span>} />
          <Row label="Titulaire" value="Konan Yao" />
          <Row label="Parcours" value="Le vivant et son environnement (SVT)" />
          <Row label="Délivré le" value="12 juin 2026" />
          <Row label="Statut" value={<span className="font-semibold text-green-600">Valide</span>} />
        </dl>

        <div className="mt-6 flex items-center justify-center gap-2 text-[var(--text-secondary)]">
          <LogoMark className="h-8 w-auto" />
          <span className="text-xs">DPFC · MENAET — République de Côte d'Ivoire</span>
        </div>
      </div>

      <div className="mt-8">
        <Logo />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
