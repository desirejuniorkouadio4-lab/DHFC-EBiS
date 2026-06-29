"use client";

import { useState, useTransition } from "react";
import { Eye, Users, Lock } from "lucide-react";
import { updateUserPrefs } from "@/lib/profile/actions";
import type { ProfileData } from "@/lib/profile/db";
import { cn } from "@/lib/utils";

type BoolKey = "showInLeaderboard" | "allowMessages" | "showActivity" | "emailNotif" | "weeklyDigest" | "marketingConsent";

const VISIBILITY = [
  { value: "PUBLIC", label: "Public", desc: "Visible par tous les utilisateurs", icon: Eye },
  { value: "COHORT", label: "Ma cohorte", desc: "Visible par les membres de mes cohortes", icon: Users },
  { value: "PRIVATE", label: "Privé", desc: "Visible par moi seul et l'administration", icon: Lock },
] as const;

export function PrivacySettings({ profile }: { profile: ProfileData }) {
  const [state, setState] = useState(profile);
  const [, startTransition] = useTransition();

  function setBool(key: BoolKey, value: boolean) {
    setState((s) => ({ ...s, [key]: value }));
    startTransition(() => void updateUserPrefs({ [key]: value }));
  }
  function setVisibility(value: string) {
    setState((s) => ({ ...s, profileVisibility: value }));
    startTransition(() => void updateUserPrefs({ profileVisibility: value }));
  }

  return (
    <div className="space-y-8">
      {/* Visibilité du profil */}
      <div>
        <h3 className="font-semibold">Visibilité de mon profil</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Qui peut voir vos informations (région, collège, activité) ?</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {VISIBILITY.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVisibility(v.value)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                state.profileVisibility === v.value ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-[var(--border-subtle)] hover:border-orange-300"
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <v.icon className="h-4 w-4 text-orange-500" /> {v.label}
              </span>
              <span className="mt-1 block text-xs text-[var(--text-secondary)]">{v.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactions */}
      <div>
        <h3 className="font-semibold">Interactions</h3>
        <ul className="mt-2 divide-y divide-[var(--border-subtle)]">
          <ToggleRow
            label="Apparaître dans le classement"
            desc="Votre nom et votre niveau peuvent figurer au classement de votre cohorte."
            checked={state.showInLeaderboard}
            onChange={(v) => setBool("showInLeaderboard", v)}
          />
          <ToggleRow
            label="Autoriser les messages privés"
            desc="Les autres membres de vos cohortes peuvent vous écrire."
            checked={state.allowMessages}
            onChange={(v) => setBool("allowMessages", v)}
          />
          <ToggleRow
            label="Rendre mon activité visible"
            desc="Votre progression et votre activité récente sont visibles par vos pairs."
            checked={state.showActivity}
            onChange={(v) => setBool("showActivity", v)}
          />
        </ul>
      </div>

      {/* Notifications & consentement */}
      <div>
        <h3 className="font-semibold">Notifications &amp; consentement</h3>
        <ul className="mt-2 divide-y divide-[var(--border-subtle)]">
          <ToggleRow
            label="Notifications par e-mail"
            desc="Rappels d'échéances, corrections, certificats."
            checked={state.emailNotif}
            onChange={(v) => setBool("emailNotif", v)}
          />
          <ToggleRow
            label="Digest hebdomadaire"
            desc="Un récapitulatif de votre activité chaque semaine."
            checked={state.weeklyDigest}
            onChange={(v) => setBool("weeklyDigest", v)}
          />
          <ToggleRow
            label="Communications non essentielles"
            desc="Nouveautés et informations du dispositif (consentement RGPD, révocable à tout moment)."
            checked={state.marketingConsent}
            onChange={(v) => setBool("marketingConsent", v)}
          />
        </ul>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <li className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-[var(--text-secondary)]">{desc}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn("inline-flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors", checked ? "bg-orange-500" : "bg-neutral-300 dark:bg-neutral-700")}
      >
        <span className={cn("h-5 w-5 rounded-full bg-white shadow transition-transform duration-200", checked ? "translate-x-5" : "translate-x-0")} />
      </button>
    </li>
  );
}
