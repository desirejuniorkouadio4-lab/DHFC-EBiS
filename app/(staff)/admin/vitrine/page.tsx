import Link from "next/link";
import { ArrowLeft, LayoutTemplate, ExternalLink } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { listPartenairesAdmin, listActualitesAdmin, listRessourcesAdmin, listTemoignagesAdmin } from "@/lib/vitrine/db";
import {
  createPartenaire, updatePartenaire, deletePartenaire, togglePartenaire,
  createActualite, updateActualite, deleteActualite, toggleActualite,
  createRessource, updateRessource, deleteRessource, toggleRessource,
  createTemoignage, updateTemoignage, deleteTemoignage, toggleTemoignage,
} from "@/lib/vitrine/actions";
import { EntityManager, type EntityItem } from "@/components/vitrine/entity-manager";
import { VitrineTabs } from "@/components/vitrine/vitrine-tabs";

export const dynamic = "force-dynamic";

export default async function AdminVitrinePage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  const [partenaires, actualites, ressources, temoignages] = await Promise.all([
    listPartenairesAdmin(),
    listActualitesAdmin(),
    listRessourcesAdmin(),
    listTemoignagesAdmin(),
  ]);
  const blobEnabled = !!process.env.BLOB_READ_WRITE_TOKEN;

  const sections = [
    {
      key: "partenaires",
      label: "Partenaires",
      count: partenaires.length,
      preview: "/partenaires",
      content: (
        <EntityManager
          items={partenaires.map((p) => ({ ...p, primary: `${p.acronym} — ${p.name}`, secondary: p.role })) as EntityItem[]}
          addLabel="Ajouter un partenaire"
          fields={[
            { name: "acronym", label: "Acronyme", required: true, placeholder: "AFD" },
            { name: "name", label: "Nom complet", required: true, full: true, placeholder: "Agence Française de Développement" },
            { name: "role", label: "Rôle", placeholder: "Bailleur de fonds" },
            { name: "logoUrl", label: "Logo du partenaire", type: "image", uploadPrefix: "partenaires", blobEnabled },
            { name: "order", label: "Ordre", type: "number" },
          ]}
          create={createPartenaire}
          update={updatePartenaire}
          remove={deletePartenaire}
          toggle={togglePartenaire}
        />
      ),
    },
    {
      key: "actualites",
      label: "Actualités",
      count: actualites.length,
      preview: "/actualites",
      content: (
        <EntityManager
          items={actualites.map((a) => ({ ...a, primary: a.title, secondary: `${a.category} · ${a.publishedAt}` })) as EntityItem[]}
          addLabel="Ajouter une actualité"
          fields={[
            { name: "title", label: "Titre", required: true, full: true },
            { name: "excerpt", label: "Résumé", type: "textarea", full: true },
            { name: "category", label: "Catégorie", placeholder: "Lancement" },
            { name: "publishedAt", label: "Date de publication", type: "date" },
            { name: "readingTime", label: "Temps de lecture (min)", type: "number" },
          ]}
          create={createActualite}
          update={updateActualite}
          remove={deleteActualite}
          toggle={toggleActualite}
        />
      ),
    },
    {
      key: "ressources",
      label: "Ressources",
      count: ressources.length,
      preview: "/ressources",
      content: (
        <EntityManager
          items={ressources.map((r) => ({ ...r, primary: r.title, secondary: `${r.type} · ${r.category}` })) as EntityItem[]}
          addLabel="Ajouter une ressource"
          fields={[
            { name: "title", label: "Titre", required: true, full: true },
            { name: "type", label: "Type", placeholder: "PDF, ePoc, Vidéo, DOCX" },
            { name: "category", label: "Catégorie", placeholder: "Guide, Référentiel, Module…" },
            { name: "size", label: "Taille", placeholder: "2,4 Mo" },
            { name: "url", label: "Lien de téléchargement", placeholder: "https://…", full: true },
            { name: "order", label: "Ordre", type: "number" },
          ]}
          create={createRessource}
          update={updateRessource}
          remove={deleteRessource}
          toggle={toggleRessource}
        />
      ),
    },
    {
      key: "temoignages",
      label: "Témoignages",
      count: temoignages.length,
      preview: "/",
      content: (
        <EntityManager
          items={temoignages.map((t) => ({ ...t, primary: t.name, secondary: `${t.role} · ${t.college}` })) as EntityItem[]}
          addLabel="Ajouter un témoignage"
          fields={[
            { name: "name", label: "Nom", required: true },
            { name: "role", label: "Fonction", placeholder: "Professeure de PC" },
            { name: "college", label: "Collège", full: true },
            { name: "quote", label: "Témoignage", type: "textarea", required: true, full: true },
            { name: "order", label: "Ordre", type: "number" },
          ]}
          create={createTemoignage}
          update={updateTemoignage}
          remove={deleteTemoignage}
          toggle={toggleTemoignage}
        />
      ),
    },
  ];

  const activePreview = sections.map((s) => ({ key: s.key, label: s.label, count: s.count, content: s.content }));

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)] hover:text-orange-600">
          <ArrowLeft className="h-4 w-4" /> Back-office
        </Link>
        <div className="mt-3 flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-green-500 text-white shadow-brand">
            <LayoutTemplate className="h-7 w-7" />
          </span>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Contenu du site vitrine</h1>
            <p className="mt-1 max-w-xl text-[var(--text-secondary)]">
              Gérez les partenaires, actualités, ressources et témoignages affichés sur le site public.
            </p>
          </div>
          <Link
            href="/"
            target="_blank"
            className="hidden h-10 shrink-0 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-semibold transition-colors hover:border-orange-400 hover:text-orange-600 sm:inline-flex"
          >
            <ExternalLink className="h-4 w-4" /> Voir le site
          </Link>
        </div>
      </div>

      <VitrineTabs sections={activePreview} />
    </div>
  );
}
