"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles } from "lucide-react";

type Mode = "password" | "magic";

/** Formulaire de connexion (démo UI — l'authentification réelle relève d'Auth.js, cf. §10). */
export function ConnexionForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [showPwd, setShowPwd] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Session simulée : on entre directement dans l'espace apprenant.
    if (mode === "password") {
      router.push("/tableau-de-bord");
      return;
    }
    setSubmitted(true);
  }

  return (
    <div className="w-full max-w-sm">
      {/* Bascule de mode */}
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-full bg-[var(--bg-secondary)] p-1">
        {(["password", "magic"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setSubmitted(false);
            }}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === m ? "bg-[var(--bg-elevated)] text-orange-600 shadow-sm" : "text-[var(--text-secondary)]"
            }`}
          >
            {m === "password" ? "Mot de passe" : "Lien magique"}
          </button>
        ))}
      </div>

      {submitted && mode === "magic" ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-50 p-6 text-center dark:bg-green-500/10">
          <Mail className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-3 font-semibold">Vérifiez votre boîte mail</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Un lien de connexion sécurisé vous a été envoyé (démo).
          </p>
          <button
            onClick={() => router.push("/tableau-de-bord")}
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-orange-600 hover:text-orange-700"
          >
            Entrer dans mon espace <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                id="email"
                type="email"
                required
                placeholder="vous@exemple.ci"
                className="h-12 w-full rounded-xl border border-neutral-300 bg-[var(--bg-primary)] pl-11 pr-4 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700"
              />
            </div>
          </div>

          {mode === "password" && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <a href="#" className="text-xs font-semibold text-orange-600 hover:underline">
                  Oublié ?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-neutral-300 bg-[var(--bg-primary)] pl-11 pr-11 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98]"
          >
            {mode === "password" ? "Se connecter" : "Recevoir mon lien"}
            {mode === "magic" ? (
              <Sparkles className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            )}
          </button>

          {submitted && mode === "password" && (
            <p className="rounded-lg bg-orange-50 px-4 py-3 text-center text-xs text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
              Démo : l'authentification réelle sera assurée par Auth.js v5 (cf. cahier §10).
            </p>
          )}
        </form>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
        L'accès est réservé aux enseignants des cohortes DHFC-EBiS. Vous avez reçu
        une invitation ? Utilisez le lien fourni par votre administrateur.
      </p>
    </div>
  );
}
