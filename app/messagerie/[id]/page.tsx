import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { requireUser } from "@/lib/auth-helpers";
import { getConversation } from "@/lib/messages/db";
import { sendMessage } from "@/lib/messages/actions";
import { SubmitButton } from "@/components/concepteur/submit-button";
import { MarkRead } from "@/components/messages/mark-read";
import { roleLabel } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function timeLabel(date: Date): string {
  return date.toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const conv = await getConversation(id, user.id);
  if (!conv) notFound();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col">
      <MarkRead conversationId={conv.id} />

      {/* En-tête */}
      <div className="flex items-center gap-3 border-b border-[var(--border-subtle)] pb-4">
        <Link href="/messagerie" aria-label="Retour" className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-subtle)] hover:border-orange-400">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white">
          {conv.otherInitials}
        </span>
        <div>
          <p className="flex items-center gap-2 font-semibold">
            {conv.otherName}
            {conv.otherRole && conv.otherRole !== "APPRENANT" && (
              <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-600 dark:bg-orange-500/10">
                {roleLabel(conv.otherRole)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex flex-1 flex-col gap-2 py-5">
        {conv.messages.length === 0 ? (
          <p className="my-auto text-center text-sm text-[var(--text-secondary)]">
            Aucun message. Écrivez le premier !
          </p>
        ) : (
          conv.messages.map((m) => (
            <div key={m.id} className={`flex ${m.fromMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.fromMe
                    ? "rounded-br-md bg-orange-500 text-white"
                    : "rounded-bl-md border border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{m.body}</p>
                <p className={`mt-1 text-[10px] ${m.fromMe ? "text-white/70" : "text-[var(--text-secondary)]"}`}>{timeLabel(m.createdAt)}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Composer */}
      <form action={sendMessage.bind(null, conv.id)} className="sticky bottom-0 flex items-end gap-2 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-3">
        <textarea
          name="body"
          required
          rows={1}
          maxLength={5000}
          placeholder="Votre message…"
          className="max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-4 py-2.5 text-sm outline-none focus:border-orange-500"
        />
        <SubmitButton pendingLabel="" className="h-11 w-11 !px-0">
          <Send className="h-4 w-4" />
        </SubmitButton>
      </form>
    </div>
  );
}
