import type { Metadata } from "next";
import { requireRole } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Lecture",
  robots: { index: false, follow: false },
};

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  await requireRole(["APPRENANT"]);
  return <>{children}</>;
}
