import { notFound, redirect } from "next/navigation";
import { CoursePlayer } from "@/components/lms/course-player";
import { getCurriculumDB, getCompletedLessonIds } from "@/lib/lms/db";
import { getSessionUser } from "@/lib/auth-helpers";

export const dynamic = "force-dynamic";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  const curriculum = await getCurriculumDB(slug);
  if (!curriculum) notFound();

  const completed = await getCompletedLessonIds(user.id, slug);

  return (
    <CoursePlayer
      slug={slug}
      lessonId={lessonId}
      curriculum={curriculum}
      initialCompleted={completed}
    />
  );
}
