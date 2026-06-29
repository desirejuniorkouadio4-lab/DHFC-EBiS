import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pin, Lock, Trash2, Send, MessageSquare, ShieldAlert } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getThread } from "@/lib/forums/db";
import { createPost, togglePin, toggleLock, deleteThread, deletePost } from "@/lib/forums/actions";
import { SubmitButton, IconSubmit } from "@/components/concepteur/submit-button";
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

export default async function ThreadPage({ params }: { params: Promise<{ threadId: string }> }) {
  const user = await requireUser();
  const { threadId } = await params;
  const thread = await getThread(threadId);
  if (!thread) notFound();

  const isStaff = user.role !== "APPRENANT";
  const canDeleteThread = isStaff || thread.authorId === user.id;
  const canReply = isStaff || !thread.locked;

  return (
    <div className="space-y-5">
      <Link href="/forums" className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600">
        <ArrowLeft className="h-4 w-4" /> Forums
      </Link>

      {/* Sujet */}
      <article className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <div className="flex items-start justify-between gap-3">
          <h1 className="flex min-w-0 items-center gap-2 text-xl font-bold leading-snug sm:text-2xl">
            {thread.pinned && <Pin className="h-5 w-5 shrink-0 text-orange-500" />}
            {thread.locked && <Lock className="h-5 w-5 shrink-0 text-[var(--text-secondary)]" />}
            <span>{thread.title}</span>
          </h1>
          <div className="flex shrink-0 items-center gap-1.5">
            {isStaff && (
              <>
                <form action={togglePin.bind(null, thread.id)}>
                  <IconSubmit label={thread.pinned ? "Désépingler" : "Épingler"}>
                    <Pin className={`h-4 w-4 ${thread.pinned ? "text-orange-500" : ""}`} />
                  </IconSubmit>
                </form>
                <form action={toggleLock.bind(null, thread.id)}>
                  <IconSubmit label={thread.locked ? "Déverrouiller" : "Verrouiller"}>
                    <Lock className={`h-4 w-4 ${thread.locked ? "text-orange-500" : ""}`} />
                  </IconSubmit>
                </form>
              </>
            )}
            {canDeleteThread && (
              <form action={deleteThread.bind(null, thread.id)}>
                <IconSubmit label="Supprimer la discussion" danger>
                  <Trash2 className="h-4 w-4" />
                </IconSubmit>
              </form>
            )}
          </div>
        </div>

        {thread.parcoursTitle && (
          <span className="mt-2 inline-block rounded-full bg-[var(--bg-secondary)] px-2.5 py-0.5 text-xs font-semibold text-[var(--text-secondary)]">
            {thread.parcoursTitle}
          </span>
        )}

        <div className="mt-4 flex items-start gap-3">
          <Avatar initials={thread.authorInitials} />
          <div className="min-w-0 flex-1">
            <AuthorLine name={thread.authorName} role={thread.authorRole} at={thread.createdAt} />
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{thread.body}</p>
          </div>
        </div>
      </article>

      {/* Réponses */}
      <div className="flex items-center gap-2 px-1">
        <MessageSquare className="h-4 w-4 text-[var(--text-secondary)]" />
        <h2 className="text-sm font-bold">
          {thread.posts.length} réponse{thread.posts.length > 1 ? "s" : ""}
        </h2>
      </div>

      <ul className="space-y-3">
        {thread.posts.map((p) => {
          const canDeletePost = isStaff || p.authorId === user.id;
          return (
            <li key={p.id} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
              <div className="flex items-start gap-3">
                <Avatar initials={p.authorInitials} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <AuthorLine name={p.authorName} role={p.authorRole} at={p.createdAt} />
                    {canDeletePost && (
                      <form action={deletePost.bind(null, p.id)}>
                        <IconSubmit label="Supprimer la réponse" danger className="h-8 w-8">
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconSubmit>
                      </form>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{p.body}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Répondre */}
      {canReply ? (
        <form action={createPost.bind(null, thread.id)} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <label htmlFor="body" className="text-sm font-semibold">
            Votre réponse
          </label>
          <textarea
            id="body"
            name="body"
            required
            rows={3}
            maxLength={5000}
            placeholder="Partagez votre réponse…"
            className="mt-2 w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none focus:border-orange-500"
          />
          <div className="mt-3 flex justify-end">
            <SubmitButton pendingLabel="Envoi…" className="px-5">
              <Send className="h-4 w-4" /> Répondre
            </SubmitButton>
          </div>
        </form>
      ) : (
        <p className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] p-5 text-sm text-[var(--text-secondary)]">
          <ShieldAlert className="h-4 w-4" /> Cette discussion est verrouillée.
        </p>
      )}
    </div>
  );
}

function Avatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
      {initials}
    </span>
  );
}

function AuthorLine({ name, role, at }: { name: string; role: string; at: Date }) {
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
      <span className="font-semibold">{name}</span>
      {role !== "APPRENANT" && (
        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-600 dark:bg-orange-500/10">
          {roleLabel(role)}
        </span>
      )}
      <span className="text-xs text-[var(--text-secondary)]">· {relativeTime(at)}</span>
    </p>
  );
}
