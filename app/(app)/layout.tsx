import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProgressProvider } from "@/components/lms/progress-store";
import { AppShell } from "@/components/lms/app-shell";
import { getSessionUser } from "@/lib/auth-helpers";

export const metadata: Metadata = {
  title: "Espace apprenant",
  robots: { index: false, follow: false },
};

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  return (
    <ProgressProvider>
      <AppShell user={user}>{children}</AppShell>
    </ProgressProvider>
  );
}
