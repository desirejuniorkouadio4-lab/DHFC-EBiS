import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Lecture",
  robots: { index: false, follow: false },
};

export default async function PlayerLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  return <>{children}</>;
}
