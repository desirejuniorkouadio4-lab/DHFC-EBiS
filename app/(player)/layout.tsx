import type { Metadata } from "next";
import { ProgressProvider } from "@/components/lms/progress-store";

export const metadata: Metadata = {
  title: "Lecture",
  robots: { index: false, follow: false },
};

export default function PlayerLayout({ children }: { children: React.ReactNode }) {
  return <ProgressProvider>{children}</ProgressProvider>;
}
