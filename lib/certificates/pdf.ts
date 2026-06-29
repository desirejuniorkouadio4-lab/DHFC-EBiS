import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "node:fs";
import path from "node:path";

/** Génération du PDF de certificat (§18.1) — pdf-lib, sans dépendance native. */

const ORANGE = rgb(0.953, 0.573, 0); // #F39200
const GREEN = rgb(0, 0.588, 0.251); // #009640
const INK = rgb(0.09, 0.09, 0.09);
const GREY = rgb(0.42, 0.42, 0.42);

export type CertificateData = {
  name: string;
  parcoursTitle: string;
  issuedAt: Date;
  score: number;
  code: string;
  verifyUrl: string;
};

/** pdf-lib (StandardFonts) encode en WinAnsi : on remplace les glyphes hors Latin-1. */
function sanitize(s: string): string {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x00-\xFF]/g, "");
}

export async function renderCertificatePdf(d: CertificateData): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([842, 595]); // A4 paysage
  const { width, height } = page.getSize();
  const helv = await doc.embedFont(StandardFonts.Helvetica);
  const helvB = await doc.embedFont(StandardFonts.HelveticaBold);
  const serif = await doc.embedFont(StandardFonts.TimesRomanBold);

  // Double cadre aux couleurs de la charte
  page.drawRectangle({ x: 22, y: 22, width: width - 44, height: height - 44, borderColor: ORANGE, borderWidth: 3 });
  page.drawRectangle({ x: 31, y: 31, width: width - 62, height: height - 62, borderColor: GREEN, borderWidth: 1 });

  const center = (text: string, y: number, font: typeof helv, size: number, color = INK) => {
    const t = sanitize(text);
    const w = font.widthOfTextAtSize(t, size);
    page.drawText(t, { x: (width - w) / 2, y, size, font, color });
  };

  // Logo officiel
  try {
    const logoBytes = fs.readFileSync(path.join(process.cwd(), "public", "logo-mark.png"));
    const logo = await doc.embedPng(logoBytes);
    const lw = 84;
    const lh = (logo.height / logo.width) * lw;
    page.drawImage(logo, { x: (width - lw) / 2, y: height - 56 - lh, width: lw, height: lh });
  } catch {
    // logo optionnel
  }

  center("RÉPUBLIQUE DE CÔTE D'IVOIRE · MENAET — DPFC", height - 168, helvB, 9, GREY);
  center("CERTIFICAT DE RÉUSSITE", height - 212, serif, 30, INK);
  page.drawRectangle({ x: width / 2 - 55, y: height - 224, width: 110, height: 2, color: ORANGE });

  center("Ce certificat est décerné à", height - 262, helv, 12, GREY);
  center(d.name, height - 298, serif, 26, ORANGE);
  center("pour avoir suivi avec succès le parcours de formation continue", height - 330, helv, 12, GREY);
  center(`« ${d.parcoursTitle} »`, height - 356, helvB, 15, INK);

  // QR de vérification (à droite)
  const qrDataUrl = await QRCode.toDataURL(d.verifyUrl, { margin: 1, width: 220 });
  const qrBytes = Buffer.from(qrDataUrl.split(",")[1], "base64");
  const qr = await doc.embedPng(qrBytes);
  const qrSize = 88;
  const qrX = width - 70 - qrSize;
  page.drawImage(qr, { x: qrX, y: 58, width: qrSize, height: qrSize });
  const codeText = sanitize(d.code);
  const cw = helv.widthOfTextAtSize(codeText, 8);
  page.drawText(codeText, { x: qrX + (qrSize - cw) / 2, y: 46, size: 8, font: helv, color: GREY });

  // Date + score (à gauche)
  const dateStr = d.issuedAt.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  page.drawText("Délivré le", { x: 70, y: 128, size: 9, font: helvB, color: GREY });
  page.drawText(sanitize(dateStr), { x: 70, y: 112, size: 12, font: helv, color: INK });
  page.drawText("Score final", { x: 70, y: 86, size: 9, font: helvB, color: GREY });
  page.drawText(`${d.score} %`, { x: 70, y: 70, size: 12, font: helv, color: INK });

  // Signatures (au centre)
  const sigY = 96;
  page.drawRectangle({ x: width / 2 - 165, y: sigY, width: 120, height: 1, color: INK });
  page.drawRectangle({ x: width / 2 + 45, y: sigY, width: 120, height: 1, color: INK });
  const sigLabel = (text: string, cx: number) => {
    const t = sanitize(text);
    const w = helv.widthOfTextAtSize(t, 9);
    page.drawText(t, { x: cx - w / 2, y: sigY - 14, size: 9, font: helv, color: GREY });
  };
  sigLabel("Le Directeur de la DPFC", width / 2 - 105);
  sigLabel("Le Directeur de la DTSI", width / 2 + 105);

  center(`Certificat vérifiable en ligne · code ${d.code}`, 36, helv, 7, GREY);

  return doc.save();
}
