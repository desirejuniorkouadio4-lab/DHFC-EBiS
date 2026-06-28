import type { Metadata } from "next";
import { requireUser } from "@/lib/auth-helpers";
import { StaffShell } from "@/components/staff/staff-shell";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StaffLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <StaffShell
      role={user.role}
      name={`${user.firstName} ${user.lastName}`}
      initials={user.initials}
    >
      {children}
    </StaffShell>
  );
}
