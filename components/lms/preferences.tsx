"use client";

import { useState } from "react";

const PREFS = [
  { key: "email", label: "Notifications par e-mail", desc: "Rappels d'échéances, corrections, certificats", default: true },
  { key: "push", label: "Notifications push", desc: "Messages du tuteur et annonces de cohorte", default: true },
  { key: "digest", label: "Digest hebdomadaire", desc: "Un récapitulatif de votre activité chaque semaine", default: false },
  { key: "leaderboard", label: "Apparaître dans le classement", desc: "Classement opt-in de votre cohorte", default: false },
];

/** Préférences de notifications (§20.3) — interrupteurs interactifs (démo). */
export function NotificationPreferences() {
  const [state, setState] = useState<Record<string, boolean>>(
    Object.fromEntries(PREFS.map((p) => [p.key, p.default]))
  );

  return (
    <ul className="divide-y divide-[var(--border-subtle)]">
      {PREFS.map((pref) => {
        const on = state[pref.key];
        return (
          <li key={pref.key} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
            <div className="min-w-0">
              <p className="text-sm font-medium">{pref.label}</p>
              <p className="text-xs text-[var(--text-secondary)]">{pref.desc}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={on}
              aria-label={pref.label}
              onClick={() => setState((s) => ({ ...s, [pref.key]: !s[pref.key] }))}
              className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors ${
                on ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-700"
              }`}
            >
              <span
                className={`h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  on ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
