import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getLessonForEdit } from "@/lib/concepteur/db";
import { LessonEditor } from "@/components/concepteur/lesson-editor";

export const dynamic = "force-dynamic";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ slug: string; lessonId: string }>;
}) {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  const { slug, lessonId } = await params;
  const lesson = await getLessonForEdit(lessonId);
  if (!lesson || lesson.parcoursSlug !== slug) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href={`/concepteur/${slug}`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
      >
        <ArrowLeft className="h-4 w-4" /> {lesson.parcoursTitle}
      </Link>
      <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-orange-600">
        {lesson.moduleTitle}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">Édition de la leçon</h1>

      <LessonEditor
        lessonId={lesson.id}
        initialTitle={lesson.title}
        initialType={lesson.type}
        initialDuration={lesson.durationMin}
        initialContent={lesson.content}
        backHref={`/concepteur/${slug}`}
      />
    </div>
  );
}
