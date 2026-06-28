"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { roleHomePath } from "@/lib/rbac";

/** Enregistre les informations d'onboarding de l'utilisateur connecté. */
export async function completeOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const bivalence = String(formData.get("bivalence") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim();
  const dren = String(formData.get("dren") ?? "").trim();
  const college = String(formData.get("college") ?? "").trim();

  if (!bivalence || !region || !dren || !college) {
    redirect("/onboarding?error=1");
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { bivalence, region, dren, college },
  });

  redirect(roleHomePath(session.user.role));
}
