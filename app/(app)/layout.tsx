import type { Metadata } from "next";
import { ProgressProvider } from "@/components/lms/progress-store";
import { AppShell } from "@/components/lms/app-shell";

export const metadata: Metadata = {
  title: "Espace apprenant",
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProgressProvider>
      <AppShell>{children}</AppShell>
    </ProgressProvider>
  );
}
