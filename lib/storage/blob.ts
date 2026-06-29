import fs from "node:fs/promises";
import path from "node:path";

/**
 * Abstraction de stockage de fichiers.
 * - Production / Preview : Vercel Blob (si `BLOB_READ_WRITE_TOKEN` présent).
 * - Développement local : disque sous `public/uploads/` (servi statiquement).
 * Renvoie une URL publique stable.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo

export type UploadResult = { url: string; size: number };

function slugifyName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot >= 0 ? name.slice(dot).toLowerCase().replace(/[^a-z0-9.]/g, "") : "";
  const base = (dot >= 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 50);
  return `${base || "fichier"}${ext}`;
}

/** Téléverse des octets et renvoie une URL publique. `prefix` ex. "covers", "media". */
export async function uploadPublicFile(
  prefix: string,
  filename: string,
  data: Buffer,
  contentType: string
): Promise<UploadResult> {
  if (data.byteLength > MAX_BYTES) throw new Error("Fichier trop volumineux (max 8 Mo).");

  const safe = slugifyName(filename);
  const key = `${prefix}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}-${safe}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { put } = await import("@vercel/blob");
    const { url } = await put(key, data, { access: "public", contentType, addRandomSuffix: false });
    return { url, size: data.byteLength };
  }

  // Repli développement uniquement : écrit sous public/uploads (gitignored).
  // En production, le système de fichiers est en lecture seule → Blob obligatoire.
  if (process.env.NODE_ENV === "production") {
    throw new Error("Stockage de fichiers non configuré (BLOB_READ_WRITE_TOKEN manquant).");
  }
  const rel = `uploads/${key}`;
  const abs = path.join(process.cwd(), "public", rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, data);
  return { url: `/${rel}`, size: data.byteLength };
}

/** Supprime un fichier précédemment téléversé (best-effort). */
export async function deletePublicFile(url: string): Promise<void> {
  try {
    if (url.startsWith("/uploads/")) {
      await fs.unlink(path.join(process.cwd(), "public", url.slice(1)));
    } else if (process.env.BLOB_READ_WRITE_TOKEN && url.startsWith("http")) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
  } catch {
    // best-effort
  }
}

/** Lit un File (FormData) en Buffer, avec validations de type et taille. */
export async function fileToBuffer(
  file: File,
  opts: { accept?: string[]; maxBytes?: number } = {}
): Promise<{ buffer: Buffer; contentType: string; name: string }> {
  const maxBytes = opts.maxBytes ?? MAX_BYTES;
  if (file.size === 0) throw new Error("Fichier vide.");
  if (file.size > maxBytes) throw new Error(`Fichier trop volumineux (max ${Math.round(maxBytes / 1024 / 1024)} Mo).`);
  if (opts.accept && opts.accept.length && !opts.accept.includes(file.type)) {
    throw new Error("Type de fichier non autorisé.");
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, contentType: file.type || "application/octet-stream", name: file.name || "fichier" };
}
