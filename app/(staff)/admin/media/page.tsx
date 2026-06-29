import Link from "next/link";
import { ArrowLeft, Trash2, FileText, Image as ImageIcon, Inbox } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listMedia } from "@/lib/admin/db";
import { addMedia, deleteMedia } from "@/lib/admin/actions";
import { IconSubmit } from "@/components/concepteur/submit-button";
import { CopyButton } from "@/components/admin/copy-button";
import { Uploader } from "@/components/upload/uploader";

export const dynamic = "force-dynamic";

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export default async function AdminMediaPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const media = await listMedia();
  const totalSize = media.reduce((a, m) => a + m.size, 0);
  const blobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Médiathèque</h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          {media.length} fichier{media.length > 1 ? "s" : ""} · {humanSize(totalSize)}
        </p>
      </div>

      {/* Téléversement */}
      <Uploader
        blobEnabled={blobEnabled}
        prefix="media"
        accept="image/png,image/jpeg,image/webp,image/avif,image/gif,application/pdf"
        hint="Images ou PDF — 8 Mo max. Glissez-déposez ou cliquez."
        onUploaded={addMedia}
      />

      {media.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center">
          <Inbox className="mx-auto h-8 w-8 text-[var(--text-secondary)]" />
          <p className="mt-3 font-semibold">Médiathèque vide</p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Téléversez images et PDF réutilisables dans les parcours.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => {
            const isImage = m.contentType.startsWith("image/");
            return (
              <div key={m.id} className="flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
                <a href={m.url} target="_blank" rel="noreferrer" className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-[var(--bg-secondary)]">
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m.url} alt={m.filename} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-10 w-10 text-orange-500" />
                  )}
                </a>
                <div className="flex flex-1 flex-col p-3">
                  <p className="flex items-center gap-1.5 truncate text-xs font-semibold" title={m.filename}>
                    {isImage ? <ImageIcon className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]" /> : <FileText className="h-3.5 w-3.5 shrink-0 text-[var(--text-secondary)]" />}
                    <span className="truncate">{m.filename}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-[var(--text-secondary)]">{humanSize(m.size)}</p>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <CopyButton value={m.url} />
                    <form action={deleteMedia.bind(null, m.id)}>
                      <IconSubmit label="Supprimer le média" danger className="h-8 w-8">
                        <Trash2 className="h-4 w-4" />
                      </IconSubmit>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
