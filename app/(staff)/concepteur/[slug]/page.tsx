import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  CheckCircle2,
  FileEdit,
  Send,
  Undo2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Check,
  PlayCircle,
  FileText,
  Target,
  Pencil,
  Layers,
  Users,
  Image as ImageIcon,
} from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { getParcoursForEdit, listDisciplines } from "@/lib/concepteur/db";
import {
  updateParcoursMeta,
  setParcoursCover,
  removeParcoursCover,
  togglePublish,
  deleteParcours,
  addModule,
  renameModule,
  deleteModule,
  moveModule,
  addLesson,
  deleteLesson,
  moveLesson,
} from "@/lib/concepteur/actions";
import { SubmitButton, IconSubmit } from "@/components/concepteur/submit-button";
import { Uploader } from "@/components/upload/uploader";
import type { LessonType } from "@prisma/client";

export const dynamic = "force-dynamic";

const inputClass =
  "h-11 w-full rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20";
const labelClass = "text-sm font-medium";

const TYPE_ICON: Record<LessonType, typeof PlayCircle> = {
  VIDEO: PlayCircle,
  TEXTE: FileText,
  QUIZ: Target,
};
const TYPE_FR: Record<LessonType, string> = { VIDEO: "Vidéo", TEXTE: "Lecture", QUIZ: "Quiz" };

export default async function EditParcoursPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  const { slug } = await params;
  const [parcours, disciplines] = await Promise.all([getParcoursForEdit(slug), listDisciplines()]);
  if (!parcours) notFound();

  const totalLessons = parcours.modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const canDelete = parcours.enrolledCount === 0 && !parcours.published;
  const blobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

  return (
    <div className="space-y-8">
      {/* Fil d'Ariane + en-tête */}
      <div>
        <Link
          href="/concepteur"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" /> Parcours
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              {parcours.published ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:bg-green-500/10 dark:text-green-300">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Publié
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                  <FileEdit className="h-3.5 w-3.5" /> Brouillon
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Layers className="h-3.5 w-3.5" /> {parcours.modules.length} mod. · {totalLessons} leçons
                {parcours.enrolledCount > 0 && (
                  <>
                    {" · "}
                    <Users className="h-3.5 w-3.5" /> {parcours.enrolledCount} inscrits
                  </>
                )}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {parcours.title || "Sans titre"}
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <a
              href={`/parcours/${parcours.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
            >
              <Eye className="h-4 w-4" /> Aperçu
            </a>
            <form action={togglePublish.bind(null, parcours.id)}>
              <SubmitButton
                variant={parcours.published ? "ghost" : "primary"}
                pendingLabel="…"
                className="px-4"
              >
                {parcours.published ? (
                  <>
                    <Undo2 className="h-4 w-4" /> Dépublier
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> Publier
                  </>
                )}
              </SubmitButton>
            </form>
          </div>
        </div>
      </div>

      {/* Métadonnées */}
      <section className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
        <h2 className="font-bold">Informations générales</h2>

        {/* Image de couverture */}
        <div className="mt-5 space-y-2">
          <span className={labelClass}>Image de couverture</span>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex h-28 w-full max-w-xs shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] sm:w-48">
              {parcours.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={parcours.coverUrl} alt="Couverture" className="h-full w-full object-cover" />
              ) : (
                <ImageIcon className="h-8 w-8 text-[var(--text-secondary)]" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <Uploader
                blobEnabled={blobEnabled}
                prefix="covers"
                accept="image/png,image/jpeg,image/webp,image/avif"
                maxMb={5}
                hint="JPG, PNG, WebP ou AVIF — 5 Mo max."
                compact
                onUploaded={setParcoursCover.bind(null, parcours.id)}
              />
              {parcours.coverUrl && (
                <form action={removeParcoursCover.bind(null, parcours.id)}>
                  <SubmitButton variant="subtle" pendingLabel="…" className="h-9 text-xs">
                    <Trash2 className="h-3.5 w-3.5" /> Retirer l'image
                  </SubmitButton>
                </form>
              )}
            </div>
          </div>
        </div>

        <form action={updateParcoursMeta.bind(null, parcours.id)} className="mt-5 space-y-5 border-t border-[var(--border-subtle)] pt-5">
          <div className="space-y-1.5">
            <label htmlFor="title" className={labelClass}>
              Titre <span className="text-orange-600">*</span>
            </label>
            <input id="title" name="title" required defaultValue={parcours.title} className={inputClass} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="subtitle" className={labelClass}>
              Sous-titre
            </label>
            <input
              id="subtitle"
              name="subtitle"
              defaultValue={parcours.subtitle}
              placeholder="Une phrase qui résume le parcours"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={parcours.description}
              placeholder="Décrivez le parcours, son public et ses objectifs généraux."
              className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="disciplineId" className={labelClass}>
                Discipline
              </label>
              <select id="disciplineId" name="disciplineId" defaultValue={parcours.disciplineId} className={inputClass}>
                {disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="level" className={labelClass}>
                Niveau
              </label>
              <select id="level" name="level" defaultValue={parcours.level} className={inputClass}>
                <option value="DEBUTANT">Débutant</option>
                <option value="INTERMEDIAIRE">Intermédiaire</option>
                <option value="AVANCE">Avancé</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="durationHours" className={labelClass}>
                Durée (heures)
              </label>
              <input
                id="durationHours"
                name="durationHours"
                type="number"
                min={0}
                defaultValue={parcours.durationHours}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="objectives" className={labelClass}>
                Objectifs <span className="text-[var(--text-secondary)]">(un par ligne)</span>
              </label>
              <textarea
                id="objectives"
                name="objectives"
                rows={4}
                defaultValue={parcours.objectives.join("\n")}
                className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prerequisites" className={labelClass}>
                Prérequis <span className="text-[var(--text-secondary)]">(un par ligne)</span>
              </label>
              <textarea
                id="prerequisites"
                name="prerequisites"
                rows={4}
                defaultValue={parcours.prerequisites.join("\n")}
                className="w-full resize-y rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3.5 text-sm outline-none transition-colors focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="tags" className={labelClass}>
              Tags <span className="text-[var(--text-secondary)]">(séparés par des virgules)</span>
            </label>
            <input
              id="tags"
              name="tags"
              defaultValue={parcours.tags.join(", ")}
              placeholder="démarche scientifique, collège, évaluation"
              className={inputClass}
            />
          </div>

          <div className="flex justify-end border-t border-[var(--border-subtle)] pt-5">
            <SubmitButton pendingLabel="Enregistrement…" className="px-5">
              <Check className="h-4 w-4" /> Enregistrer
            </SubmitButton>
          </div>
        </form>
      </section>

      {/* Programme : modules + leçons */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold">Programme</h2>
          <span className="text-sm text-[var(--text-secondary)]">
            {parcours.modules.length} module{parcours.modules.length > 1 ? "s" : ""}
          </span>
        </div>

        {parcours.modules.length === 0 && (
          <p className="rounded-2xl border border-dashed border-[var(--border-subtle)] p-8 text-center text-sm text-[var(--text-secondary)]">
            Aucun module. Ajoutez-en un pour commencer à structurer le parcours.
          </p>
        )}

        {parcours.modules.map((m, mi) => (
          <article key={m.id} className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5">
            {/* En-tête du module */}
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-sm font-bold text-orange-600 dark:bg-orange-500/10">
                {mi + 1}
              </span>
              <form action={renameModule.bind(null, m.id)} className="flex min-w-0 flex-1 items-center gap-1.5">
                <input
                  name="title"
                  defaultValue={m.title}
                  aria-label="Titre du module"
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1.5 font-semibold outline-none transition-colors hover:border-[var(--border-subtle)] focus:border-orange-500 focus:bg-[var(--bg-primary)]"
                />
                <IconSubmit label="Renommer le module">
                  <Check className="h-4 w-4" />
                </IconSubmit>
              </form>
              <form action={moveModule.bind(null, m.id, "up")}>
                <IconSubmit label="Monter le module" disabled={mi === 0}>
                  <ArrowUp className="h-4 w-4" />
                </IconSubmit>
              </form>
              <form action={moveModule.bind(null, m.id, "down")}>
                <IconSubmit label="Descendre le module" disabled={mi === parcours.modules.length - 1}>
                  <ArrowDown className="h-4 w-4" />
                </IconSubmit>
              </form>
              <form action={deleteModule.bind(null, m.id)}>
                <IconSubmit label="Supprimer le module" danger>
                  <Trash2 className="h-4 w-4" />
                </IconSubmit>
              </form>
            </div>

            {/* Leçons */}
            <ul className="mt-4 space-y-2">
              {m.lessons.map((l, li) => {
                const Icon = TYPE_ICON[l.type];
                return (
                  <li
                    key={l.id}
                    className="flex items-center gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 py-2.5"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-orange-500" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{l.title}</p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {TYPE_FR[l.type]} · {l.durationMin} min
                      </p>
                    </div>
                    <Link
                      href={`/concepteur/${parcours.slug}/lecon/${l.id}`}
                      aria-label="Modifier la leçon"
                      title="Modifier la leçon"
                      className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-3 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
                    >
                      <Pencil className="h-3.5 w-3.5" /> Éditer
                    </Link>
                    <form action={moveLesson.bind(null, l.id, "up")}>
                      <IconSubmit label="Monter la leçon" disabled={li === 0}>
                        <ArrowUp className="h-4 w-4" />
                      </IconSubmit>
                    </form>
                    <form action={moveLesson.bind(null, l.id, "down")}>
                      <IconSubmit label="Descendre la leçon" disabled={li === m.lessons.length - 1}>
                        <ArrowDown className="h-4 w-4" />
                      </IconSubmit>
                    </form>
                    <form action={deleteLesson.bind(null, l.id)}>
                      <IconSubmit label="Supprimer la leçon" danger>
                        <Trash2 className="h-4 w-4" />
                      </IconSubmit>
                    </form>
                  </li>
                );
              })}
            </ul>

            {/* Ajouter une leçon */}
            <form
              action={addLesson.bind(null, m.id)}
              className="mt-3 flex flex-col gap-2 rounded-xl border border-dashed border-[var(--border-subtle)] p-3 sm:flex-row sm:items-center"
            >
              <input
                name="title"
                required
                placeholder="Titre de la nouvelle leçon"
                aria-label="Titre de la leçon"
                className="h-10 min-w-0 flex-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-orange-500"
              />
              <select
                name="type"
                defaultValue="TEXTE"
                aria-label="Type de leçon"
                className="h-10 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500"
              >
                <option value="TEXTE">Lecture</option>
                <option value="VIDEO">Vidéo</option>
                <option value="QUIZ">Quiz</option>
              </select>
              <input
                name="durationMin"
                type="number"
                min={1}
                defaultValue={10}
                aria-label="Durée en minutes"
                className="h-10 w-20 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-2 text-sm outline-none focus:border-orange-500"
              />
              <SubmitButton variant="ghost" pendingLabel="Ajout…" className="h-10 shrink-0">
                <Plus className="h-4 w-4" /> Leçon
              </SubmitButton>
            </form>
          </article>
        ))}

        {/* Ajouter un module */}
        <form
          action={addModule.bind(null, parcours.id)}
          className="flex flex-col gap-2 rounded-3xl border border-dashed border-[var(--border-subtle)] p-4 sm:flex-row sm:items-center"
        >
          <input
            name="title"
            required
            placeholder="Titre du nouveau module"
            aria-label="Titre du module"
            className="h-11 min-w-0 flex-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3.5 text-sm outline-none focus:border-orange-500"
          />
          <SubmitButton pendingLabel="Ajout…" className="px-5">
            <Plus className="h-4 w-4" /> Ajouter un module
          </SubmitButton>
        </form>
      </section>

      {/* Zone de danger */}
      {canDelete && (
        <section className="rounded-3xl border border-red-200 bg-red-50/50 p-5 dark:border-red-500/20 dark:bg-red-500/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">Supprimer ce parcours</p>
              <p className="text-sm text-[var(--text-secondary)]">
                Cette action est définitive et supprime modules et leçons associés.
              </p>
            </div>
            <form action={deleteParcours.bind(null, parcours.id)}>
              <SubmitButton variant="ghost" pendingLabel="Suppression…" className="border-red-300 text-red-600 hover:border-red-400 hover:text-red-700">
                <Trash2 className="h-4 w-4" /> Supprimer
              </SubmitButton>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
