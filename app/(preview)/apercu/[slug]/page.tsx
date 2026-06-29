import { notFound, redirect } from "next/navigation";
import { getCurriculumDB } from "@/lib/lms/db";

export const dynamic = "force-dynamic";

/** Entrée de l'aperçu : redirige vers la 1ʳᵉ leçon du parcours. */
export default async function PreviewIndexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const curriculum = await getCurriculumDB(slug);
  if (!curriculum) notFound();
  const first = curriculum.flat[0];
  if (!first) redirect(`/concepteur/${slug}`);
  redirect(`/apercu/${slug}/${first.id}`);
}
