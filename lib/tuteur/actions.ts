"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-helpers";
import { recomputeAutoCompletion } from "@/lib/completion/recompute";
import { parcoursSlugOfLesson } from "@/lib/lms/progress";

function canSeeAll(role: string): boolean {
  return role === "ENCADREUR" || role === "ADMIN" || role === "SUPERADMIN";
}

/** Note une soumission (réponse longue) — réservé au tuteur de la cohorte. */
export async function gradeSubmission(submissionId: string, formData: FormData): Promise<void> {
  const actor = await requireRole(["TUTEUR", "ENCADREUR", "ADMIN", "SUPERADMIN"]);

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    select: { maxScore: true, userId: true, lessonId: true, cohort: { select: { tutorId: true } } },
  });
  if (!submission) return;
  if (!canSeeAll(actor.role) && submission.cohort?.tutorId !== actor.id) return;

  const raw = Number(formData.get("score"));
  const score = Math.min(submission.maxScore, Math.max(0, Number.isFinite(raw) ? Math.round(raw) : 0));
  const feedback = String(formData.get("feedback") ?? "").trim();

  await prisma.submission.update({
    where: { id: submissionId },
    data: {
      score,
      feedback: feedback || null,
      status: "GRADED",
      gradedById: actor.id,
      gradedAt: new Date(),
    },
  });

  // Signal « note reçue » → recalcule l'achèvement automatique de la leçon.
  const slug = await parcoursSlugOfLesson(submission.lessonId);
  if (slug) {
    await recomputeAutoCompletion(submission.userId, slug, submission.lessonId);
    revalidatePath(`/apprendre/${slug}`, "layout");
  }

  revalidatePath("/tuteur/corrections");
  revalidatePath("/tuteur");
  redirect("/tuteur/corrections");
}
