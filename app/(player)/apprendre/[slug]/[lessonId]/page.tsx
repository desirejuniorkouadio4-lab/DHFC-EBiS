import { notFound, redirect } from "next/navigation";
import { CoursePlayer } from "@/components/lms/course-player";
import { getCurriculumDB, getCompletedLessonIds, getMySubmissionsForLesson } from "@/lib/lms/db";
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

  const [completed, submissions] = await Promise.all([
    getCompletedLessonIds(user.id, slug),
    getMySubmissionsForLesson(user.id, lessonId),
  ]);

  return (
    <CoursePlayer
      slug={slug}
      lessonId={lessonId}
      curriculum={curriculum}
      initialCompleted={completed}
      submissions={submissions}
      blobEnabled={!!process.env.BLOB_READ_WRITE_TOKEN}
    />
  );
}
