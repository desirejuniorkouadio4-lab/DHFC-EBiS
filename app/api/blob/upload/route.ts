import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { auth } from "@/auth";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "application/pdf"];

/**
 * Mint un jeton d'upload client pour Vercel Blob (§ stockage).
 * Le fichier transite directement du navigateur vers Blob (pas par la fonction).
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user) throw new Error("Non autorisé");
        return {
          allowedContentTypes: ALLOWED,
          maximumSizeInBytes: 8 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async () => {
        // La persistance (cover / média / devoir) est faite côté client après l'upload.
      },
    });
    return Response.json(json);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : "Upload refusé" }, { status: 400 });
  }
}
