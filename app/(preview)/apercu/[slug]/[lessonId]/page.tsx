import { notFound } from "next/navigation";
import { CoursePlayer } from "@/components/lms/course-player";
import { getCurriculumDB } from "@/lib/lms/db";

export const dynamic = "force-dynamic";

export default async function PreviewLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  const { slug, lessonId } = await params;
  const curriculum = await getCurriculumDB(slug);
  if (!curriculum) notFound();

  return (
    <CoursePlayer
      slug={slug}
      lessonId={lessonId}
      curriculum={curriculum}
      initialCompleted={[]}
      preview
      exitHref={`/concepteur/${slug}`}
    />
  );
}
