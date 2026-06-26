"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

/** Formulaire d'inscription à la newsletter (démo — sans backend pour l'instant). */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setDone(true);
  }

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-full bg-green-50 px-5 py-3.5 text-sm font-medium text-green-700 ring-1 ring-inset ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/20">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
          <Check className="h-4 w-4" />
        </span>
        Merci ! Votre inscription a bien été prise en compte.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse e-mail
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="votre.email@exemple.ci"
        className="h-13 w-full rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-500 focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-orange-500/20 sm:flex-1 sm:rounded-full sm:text-sm"
      />
      <button
        type="submit"
        className="group inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 text-base font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98] sm:rounded-full sm:text-sm"
      >
        S'inscrire
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5 sm:h-4 sm:w-4" />
      </button>
    </form>
  );
}
