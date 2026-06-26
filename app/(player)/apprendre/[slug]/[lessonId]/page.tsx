import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/lms/course-player";
import { getCurriculum } from "@/lib/lms/curriculum";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const curriculum = getCurriculum(slug);
  if (!curriculum) notFound();

  return <CoursePlayer slug={slug} lessonId={lessonId} />;
}
