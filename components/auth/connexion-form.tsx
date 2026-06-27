"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, Loader2, AlertCircle } from "lucide-react";

type Mode = "password" | "magic";

/** Formulaire de connexion — Auth.js v5 (Credentials). */
export function ConnexionForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [magicSent, setMagicSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === "magic") {
      setMagicSent(true);
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (res?.error) {
      setError("E-mail ou mot de passe incorrect.");
      return;
    }
    router.push("/tableau-de-bord");
    router.refresh();
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
              setMagicSent(false);
              setError(null);
            }}
            className={`rounded-full py-2 text-sm font-semibold transition-colors ${
              mode === m ? "bg-[var(--bg-elevated)] text-orange-600 shadow-sm" : "text-[var(--text-secondary)]"
            }`}
          >
            {m === "password" ? "Mot de passe" : "Lien magique"}
          </button>
        ))}
      </div>

      {magicSent && mode === "magic" ? (
        <div className="rounded-2xl border border-green-500/20 bg-green-50 p-6 text-center dark:bg-green-500/10">
          <Mail className="mx-auto h-8 w-8 text-green-600" />
          <p className="mt-3 font-semibold">Bientôt disponible</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            La connexion par lien magique (Resend) sera activée prochainement. Utilisez le mot de passe pour l'instant.
          </p>
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
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  name="password"
                  type={showPwd ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

          {error && (
            <p className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Connexion…
              </>
            ) : (
              <>
                {mode === "password" ? "Se connecter" : "Recevoir mon lien"}
                {mode === "magic" ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                )}
              </>
            )}
          </button>
        </form>
      )}

      {mode === "password" && !magicSent && (
        <p className="mt-4 rounded-lg bg-[var(--bg-secondary)] px-4 py-3 text-center text-xs text-[var(--text-secondary)]">
          Compte de démonstration : <strong>konan.yao@dhfc.dpfc.ci</strong> · mot de passe <strong>demo1234</strong>
        </p>
      )}

      <p className="mt-6 text-center text-xs leading-relaxed text-[var(--text-secondary)]">
        L'accès est réservé aux enseignants des cohortes DHFC-EBiS. Vous avez reçu
        une invitation ? Utilisez le lien fourni par votre administrateur.
      </p>
    </div>
  );
}
