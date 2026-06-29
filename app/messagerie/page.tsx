import Link from "next/link";
import { MessageCircle, Plus, Send, Inbox } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { listConversations, getContacts } from "@/lib/messages/db";
import { startConversation } from "@/lib/messages/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";
import { roleLabel } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function relativeTime(date: Date): string {
  const mins = Math.round((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `${mins} min`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "hier";
  if (d < 7) return `${d} j`;
  return `${Math.round(d / 7)} sem.`;
}

export default async function MessageriePage() {
  const user = await requireUser();
  const [conversations, contacts] = await Promise.all([listConversations(user.id), getContacts(user.id)]);

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
          <MessageCircle className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Messagerie</h1>
          <p className="mt-1 text-[var(--text-secondary)]">Échangez en privé avec les membres de votre cohorte.</p>
        </div>
      </div>

      {/* Nouveau message */}
      <details className="group rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
        <summary className="flex cursor-pointer list-none items-center gap-2 font-semibold text-orange-600">
          <Plus className="h-5 w-5" /> Nouveau message
        </summary>
        {contacts.length === 0 ? (
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Aucun contact disponible pour l'instant (vous devez partager une cohorte).
          </p>
        ) : (
          <form action={startConversation} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              name="recipientId"
              required
              defaultValue=""
              className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none focus:border-orange-500"
            >
              <option value="" disabled>
                Choisir un destinataire…
              </option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {roleLabel(c.role)}
                </option>
              ))}
            </select>
            <SubmitButton pendingLabel="…" className="px-5">
              <Send className="h-4 w-4" /> Démarrer
            </SubmitButton>
          </form>
        )}
      </details>

      {/* Conversations */}
      {conversations.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Aucune conversation</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Démarrez un échange avec un membre de votre cohorte.</p>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--border-subtle)] overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          {conversations.map((c) => (
            <li key={c.id}>
              <Link href={`/messagerie/${c.id}`} className="flex items-center gap-3 p-4 transition-colors hover:bg-[var(--bg-secondary)]">
                <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white">
                  {c.otherInitials}
                  {c.unread && <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-elevated)] bg-orange-500" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 truncate font-semibold">
                      {c.otherName}
                      {c.otherRole && c.otherRole !== "APPRENANT" && (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/10">
                          {roleLabel(c.otherRole)}
                        </span>
                      )}
                    </p>
                    <span className="shrink-0 text-xs text-[var(--text-secondary)]">{relativeTime(c.lastMessageAt)}</span>
                  </div>
                  <p className={`truncate text-sm ${c.unread ? "font-semibold text-[var(--text-primary)]" : "text-[var(--text-secondary)]"}`}>
                    {c.fromMe && <span className="text-[var(--text-secondary)]">Vous : </span>}
                    {c.lastMessage}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
