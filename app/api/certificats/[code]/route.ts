import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderCertificatePdf } from "@/lib/certificates/pdf";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://dhfc-ebis.vercel.app";
}

/** Sert le PDF d'un certificat (génération à la demande + cache Vercel Blob). */
export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  const cert = await prisma.certificate.findUnique({
    where: { code },
    select: {
      code: true,
      score: true,
      issuedAt: true,
      pdfUrl: true,
      user: { select: { firstName: true, lastName: true } },
      parcours: { select: { title: true } },
    },
  });
  if (!cert) return new NextResponse("Certificat introuvable", { status: 404 });

  // Déjà stocké sur Blob → URL stable.
  if (cert.pdfUrl) return NextResponse.redirect(cert.pdfUrl);

  const bytes = await renderCertificatePdf({
    name: `${cert.user.firstName} ${cert.user.lastName}`,
    parcoursTitle: cert.parcours.title,
    issuedAt: cert.issuedAt,
    score: cert.score,
    code: cert.code,
    verifyUrl: `${siteUrl()}/verifier/${cert.code}`,
  });

  // Si Vercel Blob est configuré : on persiste le PDF et on sert l'URL stable.
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const { put } = await import("@vercel/blob");
      const { url } = await put(`certificats/${cert.code}.pdf`, Buffer.from(bytes), {
        access: "public",
        contentType: "application/pdf",
      });
      await prisma.certificate.update({ where: { code: cert.code }, data: { pdfUrl: url } });
      return NextResponse.redirect(url);
    } catch {
      // repli : on sert le PDF généré directement
    }
  }

  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="certificat-${cert.code}.pdf"`,
    },
  });
}
