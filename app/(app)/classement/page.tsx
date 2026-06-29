import { Trophy, Star, Award, Flame, Medal } from "lucide-react";
import { getSessionUser } from "@/lib/auth-helpers";
import { getCohortLeaderboard } from "@/lib/gamification/leaderboard";
import { nextLevelXp } from "@/lib/gamification/xp";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MEDAL = ["text-amber-500", "text-neutral-400", "text-orange-700"];

export default async function ClassementPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const { rows, myRank } = await getCohortLeaderboard(user.id);
  const target = nextLevelXp(user.level);
  const prev = (user.level - 1) * 300;
  const levelPct = Math.min(100, Math.round(((user.xp - prev) / (target - prev)) * 100));

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
          <Trophy className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Classement</h1>
          <p className="text-[var(--text-secondary)]">Votre progression face à votre cohorte.</p>
        </div>
      </div>

      {/* Ma carte */}
      <div className="rounded-3xl border border-orange-200 bg-[var(--bg-elevated)] p-6 dark:border-orange-500/30">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-lg font-bold text-white">
              {user.initials}
            </span>
            <div>
              <p className="text-sm text-[var(--text-secondary)]">
                Niveau {user.level}
                {myRank ? ` · ${myRank}ᵉ de la cohorte` : ""}
              </p>
              <p className="flex items-center gap-1.5 text-xl font-bold">
                <Star className="h-5 w-5 fill-orange-400 text-orange-400" /> {user.xp.toLocaleString("fr-FR")} XP
              </p>
            </div>
          </div>
          {myRank && myRank <= 3 && <Medal className={cn("h-9 w-9", MEDAL[myRank - 1])} />}
        </div>
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-xs text-[var(--text-secondary)]">
            <span>Niveau {user.level}</span>
            <span>{Math.max(0, target - user.xp)} XP avant niveau {user.level + 1}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-secondary)]">
            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-green-500" style={{ width: `${levelPct}%` }} />
          </div>
        </div>
      </div>

      {/* Classement */}
      {rows.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Flame className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Pas encore de cohorte</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Gagnez de l'XP en terminant des leçons et des quiz.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((r) => (
            <li
              key={r.userId}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-3",
                r.isMe ? "border-orange-300 bg-orange-50 dark:border-orange-500/30 dark:bg-orange-500/10" : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center">
                {r.rank <= 3 ? (
                  <Medal className={cn("h-6 w-6", MEDAL[r.rank - 1])} />
                ) : (
                  <span className="text-sm font-bold text-[var(--text-secondary)]">{r.rank}</span>
                )}
              </span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                {r.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">
                  {r.name}
                  {r.isMe && <span className="ml-2 rounded-full bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">Vous</span>}
                </p>
                <p className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                  <span>Niveau {r.level}</span>
                  <span className="inline-flex items-center gap-1">
                    <Award className="h-3.5 w-3.5" /> {r.badges}
                  </span>
                </p>
              </div>
              <span className="shrink-0 text-right">
                <span className="flex items-center gap-1 font-bold text-orange-600">
                  <Star className="h-4 w-4 fill-orange-400 text-orange-400" /> {r.xp.toLocaleString("fr-FR")}
                </span>
                <span className="text-[10px] uppercase text-[var(--text-secondary)]">XP</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
