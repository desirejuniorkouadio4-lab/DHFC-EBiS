import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Aperçu apprenant",
  robots: { index: false, follow: false },
};

/** Aperçu concepteur d'un parcours « en tant qu'apprenant » (plein écran, sans coque staff). */
export default async function PreviewLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  return <>{children}</>;
}
