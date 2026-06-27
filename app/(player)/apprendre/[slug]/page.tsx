import { redirect, notFound } from "next/navigation";
import { getResumeLessonId } from "@/lib/lms/db";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

/** Redirige vers la première leçon non terminée du parcours (reprise). */
export default async function ApprendreRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  const lessonId = await getResumeLessonId(user.id, slug);
  if (!lessonId) notFound();

  redirect(`/apprendre/${slug}/${lessonId}`);
}
