"use client";

import Link from "next/link";
import {
  PlayCircle,
  ArrowRight,
  CheckCircle2,
  Trophy,
  Lock,
  CalendarClock,
  Radio,
  FileText,
  Target,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { CountUp } from "@/components/motion/count-up";
import { Rail, RailItem } from "@/components/ui/rail";
import { DISCIPLINES } from "@/lib/data";
import { USER_STATS, BADGES, ACTIVITY, PLANNING } from "@/lib/lms/data";
import type { EnrollmentView } from "@/lib/lms/db";
import { ProgressBar } from "@/components/lms/progress-bar";
import { formatDate, cn } from "@/lib/utils";

/* ===========================================================
 *  Continuer où j'en étais
 * =========================================================== */
export function ContinueCard({ enrollment }: { enrollment: EnrollmentView }) {
  const discipline = DISCIPLINES.find((d) => d.slug === enrollment.disciplineSlug);
  const percent = enrollment.percent;
  const Icon = discipline?.icon ?? BookOpen;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-neutral-950 p-6 text-white sm:p-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-orange-500/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-40 w-40 rounded-full bg-green-500/20 blur-3xl" />
        <Icon className="absolute -bottom-6 right-4 h-40 w-40 opacity-[0.06]" />
      </div>
      <div className="relative">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
          <PlayCircle className="h-3.5 w-3.5" />
          Continuer où j'en étais
        </span>
        <h2 className="mt-4 text-xl font-bold sm:text-2xl">{enrollment.title}</h2>
        <p className="mt-1.5 text-sm text-white/70">
          {enrollment.currentLessonLabel || "Commencez votre parcours"}
        </p>

        <div className="mt-5 max-w-md">
          <div className="mb-1.5 flex items-center justify-between text-xs text-white/70">
            <span>Progression</span>
            <span className="font-semibold text-white">{percent} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-[width] duration-700"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        <Link
          href={`/apprendre/${enrollment.slug}/${enrollment.resumeLessonId}`}
          className="group mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-neutral-950 transition-all hover:-translate-y-0.5"
        >
          Reprendre la leçon
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

/* ===========================================================
 *  Statistiques
 * =========================================================== */
export function StatsRow() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {USER_STATS.map((stat) => (
        <div
          key={stat.label}
          className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            <stat.icon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="font-display text-2xl font-extrabold leading-none">
              <CountUp value={stat.value} suffix={stat.suffix} />
            </div>
            <div className="mt-1 truncate text-xs text-[var(--text-secondary)]">{stat.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ===========================================================
 *  Carte de parcours suivi
 * =========================================================== */
export function EnrolledCourseCard({ enrollment }: { enrollment: EnrollmentView }) {
  const discipline = DISCIPLINES.find((d) => d.slug === enrollment.disciplineSlug);
  const Icon = discipline?.icon ?? BookOpen;
  const { completed, total, percent } = enrollment;
  const done = percent >= 100;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div
        className="relative flex h-24 items-center px-5"
        style={{ background: `linear-gradient(135deg, ${discipline?.color}1f, ${discipline?.color}08)` }}
      >
        <span
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow"
          style={{ backgroundColor: discipline?.color }}
        >
          <Icon className="h-6 w-6" />
        </span>
        {done && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-xs font-semibold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" /> Terminé
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-bold leading-snug">{enrollment.title}</h3>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">{enrollment.cohort}</p>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-[var(--text-secondary)]">
              {completed}/{total} leçons
            </span>
            <span className="font-semibold text-orange-600">{percent} %</span>
          </div>
          <ProgressBar value={percent} />
        </div>

        <div className="mt-3 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-[10px] font-bold text-white">
            {enrollment.tutorInitials}
          </span>
          Tuteur · {enrollment.tutor}
        </div>

        <Link
          href={`/apprendre/${enrollment.slug}/${enrollment.resumeLessonId}`}
          className="group mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-full bg-orange-500 text-sm font-semibold text-white transition-all hover:bg-orange-600"
        >
          {done ? "Revoir le parcours" : "Reprendre"}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export function EnrolledCoursesGrid({ enrollments }: { enrollments: EnrollmentView[] }) {
  if (enrollments.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-sm text-[var(--text-secondary)]">
        Vous n'êtes inscrit à aucun parcours pour le moment.
      </p>
    );
  }
  return (
    <Rail cols="lg:grid-cols-2 lg:gap-5 xl:grid-cols-3">
      {enrollments.map((e) => (
        <RailItem key={e.slug} width="w-[82%] sm:w-[55%]">
          <EnrolledCourseCard enrollment={e} />
        </RailItem>
      ))}
    </Rail>
  );
}

/* ===========================================================
 *  Badges
 * =========================================================== */
const RARITY_RING: Record<string, string> = {
  commun: "ring-neutral-200 dark:ring-neutral-700",
  rare: "ring-blue-300 dark:ring-blue-500/40",
  "épique": "ring-orange-300 dark:ring-orange-500/40",
  "légendaire": "ring-green-300 dark:ring-green-500/40",
};

export function BadgesGallery() {
  return (
    <div className="flex flex-wrap gap-3">
      {BADGES.map((badge) => (
        <div
          key={badge.slug}
          title={`${badge.name} — ${badge.description}`}
          className={cn(
            "group flex w-[88px] flex-col items-center gap-2 rounded-2xl border border-[var(--border-subtle)] p-3 text-center transition-transform hover:-translate-y-1",
            !badge.earned && "opacity-50"
          )}
        >
          <span
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full ring-2",
              badge.earned
                ? "bg-gradient-to-br from-orange-500 to-green-500 text-white"
                : "bg-[var(--bg-secondary)] text-neutral-400",
              RARITY_RING[badge.rarity]
            )}
          >
            {badge.earned ? <badge.icon className="h-6 w-6" /> : <Lock className="h-5 w-5" />}
          </span>
          <span className="text-[11px] font-semibold leading-tight">{badge.name}</span>
        </div>
      ))}
    </div>
  );
}

/* ===========================================================
 *  Activité récente
 * =========================================================== */
const ACTIVITY_ICON = {
  quiz: Target,
  lesson: CheckCircle2,
  badge: Trophy,
  message: MessageSquare,
} as const;

export function ActivityTimeline() {
  return (
    <ul className="space-y-1">
      {ACTIVITY.map((item, i) => {
        const Icon = ACTIVITY_ICON[item.type];
        return (
          <li key={i} className="flex gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-[var(--bg-secondary)]">
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-500/10">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm leading-snug">{item.label}</p>
              <p className="text-xs text-[var(--text-secondary)]">{item.time}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/* ===========================================================
 *  Planning / prochains rendez-vous
 * =========================================================== */
const PLANNING_ICON = { devoir: FileText, live: Radio, quiz: Target } as const;
const PLANNING_TONE = {
  devoir: "bg-orange-50 text-orange-600 dark:bg-orange-500/10",
  live: "bg-green-50 text-green-600 dark:bg-green-500/10",
  quiz: "bg-blue-50 text-blue-600 dark:bg-blue-500/10",
} as const;

export function PlanningList() {
  return (
    <ul className="space-y-3">
      {PLANNING.map((item, i) => {
        const Icon = PLANNING_ICON[item.kind];
        return (
          <li key={i} className="flex items-start gap-3">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl", PLANNING_TONE[item.kind])}>
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug">{item.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <CalendarClock className="h-3.5 w-3.5" />
                {formatDate(item.date)} · {item.due}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
