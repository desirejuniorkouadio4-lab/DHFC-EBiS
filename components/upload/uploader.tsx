"use client";

import { useRef, useState } from "react";
import { UploadCloud, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type UploadResult = { url: string; filename: string; contentType: string; size: number };

/**
 * Zone de téléversement : upload automatique dès qu'un fichier est choisi
 * ou déposé. En production → Vercel Blob (upload client direct) ; en dev →
 * route disque. Appelle `onUploaded` (server action) avec l'URL obtenue.
 */
export function Uploader({
  blobEnabled,
  prefix,
  accept,
  maxMb = 8,
  onUploaded,
  hint,
  compact,
}: {
  blobEnabled: boolean;
  prefix: string;
  accept: string;
  maxMb?: number;
  onUploaded: (r: UploadResult) => Promise<void>;
  hint?: string;
  compact?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (file.size > maxMb * 1024 * 1024) {
      setError(`Fichier trop volumineux (max ${maxMb} Mo).`);
      return;
    }
    setBusy(true);
    try {
      let result: UploadResult;
      if (blobEnabled) {
        const { upload } = await import("@vercel/blob/client");
        const blob = await upload(`${prefix}/${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          contentType: file.type || undefined,
        });
        result = { url: blob.url, filename: file.name, contentType: file.type, size: file.size };
      } else {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("prefix", prefix);
        const res = await fetch("/api/upload-dev", { method: "POST", body: fd });
        if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Échec du téléversement");
        result = await res.json();
      }
      await onUploaded(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec du téléversement");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void handleFile(e.dataTransfer.files?.[0]);
        }}
        disabled={busy}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-center transition-colors disabled:opacity-70",
          compact ? "px-4 py-4" : "px-6 py-8",
          dragOver ? "border-orange-500 bg-orange-50 dark:bg-orange-500/10" : "border-[var(--border-subtle)] hover:border-orange-400"
        )}
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            <span className="text-sm font-medium text-[var(--text-secondary)]">Téléversement…</span>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-orange-500" />
            <span className="text-sm font-medium">
              Glissez un fichier ici ou <span className="text-orange-600">cliquez pour choisir</span>
            </span>
            {hint && <span className="text-xs text-[var(--text-secondary)]">{hint}</span>}
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0] ?? undefined)}
      />

      {error && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" /> {error}
        </p>
      )}
    </div>
  );
}
