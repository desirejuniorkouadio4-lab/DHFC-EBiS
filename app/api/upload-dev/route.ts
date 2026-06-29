import { auth } from "@/auth";
import { uploadPublicFile, fileToBuffer } from "@/lib/storage/blob";

export const runtime = "nodejs";

/**
 * Téléversement en développement local (pas de jeton Blob) : écrit sur disque.
 * En production, Blob est utilisé via l'upload client (`/api/blob/upload`).
 */
export async function POST(request: Request): Promise<Response> {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Utilisez l'upload Blob en production." }, { status: 400 });
  }
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Non autorisé" }, { status: 401 });

  const fd = await request.formData();
  const file = fd.get("file");
  const prefix = String(fd.get("prefix") ?? "media").replace(/[^a-z]/g, "") || "media";
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Fichier manquant" }, { status: 400 });
  }

  try {
    const { buffer, contentType, name } = await fileToBuffer(file);
    const { url, size } = await uploadPublicFile(prefix, name, buffer, contentType);
    return Response.json({ url, filename: name, contentType, size });
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Échec" }, { status: 400 });
  }
}
