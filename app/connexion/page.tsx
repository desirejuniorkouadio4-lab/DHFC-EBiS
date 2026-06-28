import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ConnexionForm } from "@/components/auth/connexion-form";
import { auth } from "@/auth";
import { roleHomePath } from "@/lib/rbac";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace DHFC-EBiS.",
  robots: { index: false, follow: false },
};

const PROOFS = [
  "Suivez vos parcours en ligne et hors-ligne",
  "Échangez avec votre tuteur et votre cohorte",
  "Obtenez vos certificats officiels DPFC",
];

export default async function ConnexionPage() {
  const session = await auth();
  if (session?.user) redirect(roleHomePath(session.user.role));
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panneau de marque */}
      <div className="relative hidden overflow-hidden bg-neutral-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-orange-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-green-500/20 blur-3xl" />
          <div className="absolute inset-0 bg-grid opacity-20" />
        </div>

        <Link href="/" className="relative">
          <Logo variant="white" />
        </Link>

        <div className="relative">
          <LogoMark variant="white" className="h-16 w-auto opacity-90" />
          <h1 className="mt-6 max-w-md text-balance text-3xl font-extrabold leading-tight">
            Votre espace de formation continue
          </h1>
          <p className="mt-4 max-w-sm text-white/60">
            Reprenez vos parcours là où vous les avez laissés, partout et à tout
            moment.
          </p>
          <ul className="mt-8 space-y-3">
            {PROOFS.map((p) => (
              <li key={p} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-white/40">
          © {new Date().getFullYear()} DHFC-EBiS — DPFC / MENAET
        </p>
      </div>

      {/* Panneau formulaire */}
      <div className="relative flex flex-col items-center justify-center p-6 sm:p-10">
        <Link
          href="/"
          className="absolute left-6 top-6 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <div className="lg:hidden">
          <Logo />
        </div>

        <div className="mt-10 w-full max-w-sm text-center lg:mt-0">
          <h2 className="text-2xl font-bold">Bon retour parmi nous</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Connectez-vous pour accéder à vos parcours.
          </p>
        </div>

        <div className="mt-8 flex w-full justify-center">
          <ConnexionForm />
        </div>
      </div>
    </div>
  );
}
