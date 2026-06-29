"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHomePath } from "@/lib/rbac";
import { setImpersonatedId, clearImpersonation } from "@/lib/impersonation";

const ADMIN_ROLES = ["ADMIN", "SUPERADMIN"];

/**
 * Démarre une impersonation : l'admin connecté « devient » l'utilisateur cible.
 * Garde-fous : seul un ADMIN/SUPERADMIN réel peut le faire ; un ADMIN ne peut
 * pas impersonner un SUPERADMIN (anti-escalade) ; pas soi-même.
 */
export async function startImpersonation(targetUserId: string): Promise<void> {
  const session = await auth();
  const realRole = session?.user?.role;
  const realId = session?.user?.id;
  if (!realId || !realRole || !ADMIN_ROLES.includes(realRole)) return;
  if (targetUserId === realId) return;

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, role: true },
  });
  if (!target) return;
  if (target.role === "SUPERADMIN" && realRole !== "SUPERADMIN") return;

  await setImpersonatedId(target.id);
  redirect(roleHomePath(target.role));
}

/**
 * Impersonne un utilisateur représentatif d'un rôle donné (« prendre un rôle »).
 */
export async function impersonateRole(role: string): Promise<void> {
  const session = await auth();
  const realRole = session?.user?.role;
  const realId = session?.user?.id;
  if (!realId || !realRole || !ADMIN_ROLES.includes(realRole)) return;
  if (role === "SUPERADMIN" && realRole !== "SUPERADMIN") return;

  const candidate = await prisma.user.findFirst({
    where: { role: role as never, active: true, id: { not: realId } },
    orderBy: { createdAt: "asc" },
    select: { id: true },
  });
  if (!candidate) return;
  await setImpersonatedId(candidate.id);
  redirect(roleHomePath(role));
}

/** Met fin à l'impersonation et revient au back-office. */
export async function stopImpersonation(): Promise<void> {
  await clearImpersonation();
  redirect("/admin");
}
