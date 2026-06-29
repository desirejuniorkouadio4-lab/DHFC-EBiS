import Link from "next/link";
import { MessageSquare, Pin, Lock, Plus, MessagesSquare, Reply } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { listThreads, listForumParcours } from "@/lib/forums/db";
import { createThread } from "@/lib/forums/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";
import { roleLabel } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function relativeTime(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `il y a ${d} j`;
  return `il y a ${Math.round(d / 7)} sem.`;
}

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none transition-colors focus:border-orange-500";

export default async function ForumsPage({ searchParams }: { searchParams: Promise<{ parcours?: string }> }) {
  await requireUser();
  const { parcours: parcoursSlug } = await searchParams;
  const [threads, parcoursList] = await Promise.all([
    listThreads({ parcoursSlug }),
    listForumParcours(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <MessagesSquare className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Forums communautaires</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Posez vos questions, échangez avec votre cohorte et vos tuteurs.</p>
        </div>
      </div>

      {/* Nouvelle discussion */}
      <details className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-orange-600">
          <Plus className="h-5 w-5" /> Lancer une discussion
        </summary>
        <form action={createThread} className="mt-4 space-y-3">
          <input name="title" required maxLength={160} placeholder="Titre de la discussion" className={inputClass} />
          <textarea
            name="body"
            required
            rows={4}
            maxLength={5000}
            placeholder="Décrivez votre question ou votre sujet…"
            className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none focus:border-orange-500"
          />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select name="parcoursSlug" defaultValue="" className={`${inputClass} sm:w-72`}>
              <option value="">Forum général</option>
              {parcoursList.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.title}
                </option>
              ))}
            </select>
            <SubmitButton pendingLabel="Publication…" className="px-5">
              <Plus className="h-4 w-4" /> Publier la discussion
            </SubmitButton>
          </div>
        </form>
      </details>

      {/* Filtres */}
      <div className="flex flex-wrap gap-1.5">
        <FilterChip label="Toutes" href="/forums" active={!parcoursSlug} />
        {parcoursList.map((p) => (
          <FilterChip key={p.slug} label={p.title} href={`/forums?parcours=${p.slug}`} active={parcoursSlug === p.slug} />
        ))}
      </div>

      {/* Discussions */}
      {threads.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <MessageSquare className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucune discussion ici</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Soyez le premier à lancer un sujet.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {threads.map((t) => (
            <li key={t.id}>
              <Link
                href={`/forums/${t.id}`}
                className="group block rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 transition-colors hover:border-orange-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="flex min-w-0 items-center gap-2 font-semibold leading-snug group-hover:text-orange-600">
                    {t.pinned && <Pin className="h-4 w-4 shrink-0 text-orange-500" />}
                    {t.locked && <Lock className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />}
                    <span className="truncate">{t.title}</span>
                  </h2>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--bg-secondary)] px-2.5 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                    <Reply className="h-3.5 w-3.5" /> {t.replyCount}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-[var(--text-secondary)]">{t.excerpt}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--text-secondary)]">
                  <span className="font-medium text-[var(--text-primary)]">{t.authorName}</span>
                  {t.authorRole !== "APPRENANT" && (
                    <span className="rounded-full bg-orange-50 px-2 py-0.5 font-semibold text-orange-600 dark:bg-orange-500/10">
                      {roleLabel(t.authorRole)}
                    </span>
                  )}
                  {t.parcoursTitle && <span className="rounded-full bg-[var(--bg-secondary)] px-2 py-0.5">{t.parcoursTitle}</span>}
                  <span>· {relativeTime(t.lastActivityAt)}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`max-w-[14rem] truncate rounded-full px-3 py-1.5 text-sm font-semibold transition-colors ${
        active ? "bg-orange-500 text-white" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      }`}
    >
      {label}
    </Link>
  );
}
