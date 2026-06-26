"use client";

import { useState } from "react";
import { Send, CheckCircle2 } from "lucide-react";

const SUBJECTS = [
  "Question sur un parcours",
  "Problème d'accès / connexion",
  "Devenir tuteur",
  "Partenariat",
  "Autre",
];

/** Formulaire de contact (démo — validation côté client, sans backend). */
export function ContactForm() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-green-500/20 bg-green-50 p-10 text-center dark:bg-green-500/10">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="text-xl font-bold">Message envoyé</h3>
        <p className="max-w-sm text-sm text-[var(--text-secondary)]">
          Merci de nous avoir contactés. Notre équipe vous répondra dans les
          meilleurs délais à l'adresse indiquée.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-sm font-semibold text-orange-600 hover:text-orange-700"
        >
          Envoyer un autre message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-7 shadow-sm sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nom complet" htmlFor="name">
          <input id="name" name="name" required className={inputClass} placeholder="Konan Yao" />
        </Field>
        <Field label="Adresse e-mail" htmlFor="email">
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="vous@exemple.ci"
          />
        </Field>
      </div>

      <Field label="Sujet" htmlFor="subject">
        <select id="subject" name="subject" className={inputClass} defaultValue="">
          <option value="" disabled>
            Sélectionnez un sujet
          </option>
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Message" htmlFor="message">
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full resize-none rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 py-3 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-500 focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-orange-500/20 sm:text-sm"
          placeholder="Décrivez votre demande…"
        />
      </Field>

      <button
        type="submit"
        className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600 active:scale-[0.98] sm:w-auto"
      >
        Envoyer le message
        <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </form>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-4 text-base outline-none transition-colors placeholder:text-neutral-400 focus:border-orange-500 focus:bg-[var(--bg-primary)] focus:ring-2 focus:ring-orange-500/20 sm:text-sm";

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </label>
      {children}
    </div>
  );
}
