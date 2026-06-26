import { redirect, notFound } from "next/navigation";
import { getCurriculum } from "@/lib/lms/curriculum";
import { getEnrollment } from "@/lib/lms/data";

/** Redirige vers la dernière leçon connue (ou la première) du parcours. */
export default async function ApprendreRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const curriculum = getCurriculum(slug);
  if (!curriculum || curriculum.flat.length === 0) notFound();

  const enrollment = getEnrollment(slug);
  const target = enrollment?.lastLessonId ?? curriculum.flat[0].id;
  redirect(`/apprendre/${slug}/${target}`);
}
