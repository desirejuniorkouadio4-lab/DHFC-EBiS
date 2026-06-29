"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Uploader } from "@/components/upload/uploader";
import { setAvatar, removeAvatar } from "@/lib/profile/actions";

/** Photo de profil : aperçu + téléversement (auto à la sélection) + retrait. */
export function AvatarUploader({
  avatarUrl,
  initials,
  blobEnabled,
}: {
  avatarUrl: string | null;
  initials: string;
  blobEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4">
      {avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={avatarUrl} alt="Photo de profil" className="h-20 w-20 shrink-0 rounded-3xl object-cover" />
      ) : (
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-green-500 font-display text-2xl font-extrabold text-white">
          {initials}
        </span>
      )}
      <div className="min-w-0 space-y-2">
        <Uploader
          blobEnabled={blobEnabled}
          prefix="avatars"
          accept="image/png,image/jpeg,image/webp,image/avif"
          maxMb={3}
          compact
          hint="JPG, PNG ou WebP — 3 Mo max."
          onUploaded={async (r) => {
            await setAvatar({ url: r.url });
            router.refresh();
          }}
        />
        {avatarUrl && (
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(async () => { await removeAvatar(); router.refresh(); })}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" /> Retirer la photo
          </button>
        )}
      </div>
    </div>
  );
}
