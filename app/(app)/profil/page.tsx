import { MapPin, Building2, Mail, Award, Bell, Pencil, Zap } from "lucide-react";
import { BadgesGallery } from "@/components/lms/dashboard-widgets";
import { NotificationPreferences } from "@/components/lms/preferences";
import { ProgressBar } from "@/components/lms/progress-bar";
import { CURRENT_USER } from "@/lib/lms/data";

export default function ProfilPage() {
  const xpPercent = Math.round((CURRENT_USER.xp / CURRENT_USER.nextLevelXp) * 100);

  const infos = [
    { icon: Mail, label: "E-mail", value: CURRENT_USER.email },
    { icon: MapPin, label: "Région", value: `${CURRENT_USER.region} · ${CURRENT_USER.dren}` },
    { icon: Building2, label: "Collège", value: CURRENT_USER.college },
  ];

  return (
    <div className="space-y-8">
      {/* En-tête profil */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 sm:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/10 blur-2xl" />
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-green-500 font-display text-2xl font-extrabold text-white">
            {CURRENT_USER.initials}
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {CURRENT_USER.firstName} {CURRENT_USER.lastName}
            </h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
              <span className="rounded-full bg-orange-50 px-3 py-1 font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                {CURRENT_USER.role}
              </span>
              <span className="rounded-full bg-green-50 px-3 py-1 font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                Bivalence {CURRENT_USER.bivalence}
              </span>
            </div>
          </div>
          <button className="inline-flex h-11 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-5 text-sm font-semibold transition-colors hover:border-orange-400">
            <Pencil className="h-4 w-4" /> Modifier
          </button>
        </div>

        {/* Niveau / XP */}
        <div className="relative mt-6 rounded-2xl bg-[var(--bg-secondary)] p-5">
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Zap className="h-4 w-4 text-orange-500" />
              Niveau {CURRENT_USER.level}
            </span>
            <span className="text-sm text-[var(--text-secondary)]">
              {CURRENT_USER.xp} / {CURRENT_USER.nextLevelXp} XP
            </span>
          </div>
          <ProgressBar value={xpPercent} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Informations */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="mb-4 font-bold">Informations</h2>
          <ul className="space-y-4">
            {infos.map((info) => (
              <li key={info.label} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                  <info.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {info.label}
                  </p>
                  <p className="mt-0.5 text-sm font-medium">{info.value}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Préférences */}
        <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
          <h2 className="mb-4 flex items-center gap-2 font-bold">
            <Bell className="h-5 w-5 text-orange-500" />
            Préférences de notifications
          </h2>
          <NotificationPreferences />
        </div>
      </div>

      {/* Badges */}
      <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="mb-4 flex items-center gap-2 font-bold">
          <Award className="h-5 w-5 text-orange-500" />
          Mes badges
        </h2>
        <BadgesGallery />
      </div>
    </div>
  );
}
