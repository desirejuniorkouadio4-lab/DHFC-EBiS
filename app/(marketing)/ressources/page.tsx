import type { Metadata } from "next";
import { FileText, Download, BookOpen, FileBox, Video, GraduationCap, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Stagger, RevealItem } from "@/components/motion/reveal";
import { getRessources } from "@/lib/content";

export const metadata: Metadata = {
  title: "Ressources",
  description:
    "Bibliothèque publique du DHFC-EBiS : guides de formation, documents pédagogiques et modules ePoc.",
};

export const dynamic = "force-dynamic";

/** Icône selon le type/catégorie de ressource. */
function iconFor(type: string, category: string): LucideIcon {
  const t = type.toLowerCase();
  if (t.includes("vidéo") || t.includes("video")) return Video;
  if (t.includes("epoc")) return FileBox;
  if (category.toLowerCase().includes("guide")) return BookOpen;
  if (category.toLowerCase().includes("charte") || category.toLowerCase().includes("tutorat")) return GraduationCap;
  return FileText;
}

export default async function RessourcesPage() {
  const ressources = await getRessources();
  return (
    <>
      <PageHero
        eyebrow="Bibliothèque"
        title="Ressources en libre accès"
        description="Guides, référentiels, modules ePoc et tutoriels à télécharger librement pour accompagner votre pratique."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Ressources" }]}
      />

      <Container className="py-16 sm:py-20">
        {ressources.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-[var(--border-subtle)] p-12 text-center text-sm text-[var(--text-secondary)]">
            Aucune ressource publiée pour le moment.
          </p>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.08}>
            {ressources.map((r) => {
              const Icon = iconFor(r.type, r.category);
              return (
                <RevealItem key={r.id}>
                  <article className="group flex h-full flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-start justify-between">
                      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                        {r.category}
                      </span>
                    </div>
                    <h3 className="mt-5 flex-1 text-lg font-bold leading-snug">{r.title}</h3>
                    <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-sm">
                      <span className="text-[var(--text-secondary)]">
                        {r.type}
                        {r.size ? ` · ${r.size}` : ""}
                      </span>
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 font-semibold text-orange-600 transition-colors hover:text-orange-700"
                        >
                          <Download className="h-4 w-4" /> Télécharger
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                          <Download className="h-4 w-4" /> Bientôt
                        </span>
                      )}
                    </div>
                  </article>
                </RevealItem>
              );
            })}
          </Stagger>
        )}

        <p className="mt-10 text-center text-sm text-[var(--text-secondary)]">
          Les ressources réservées aux cohortes sont disponibles dans votre{" "}
          <a href="/connexion" className="font-semibold text-orange-600 hover:underline">
            espace apprenant
          </a>
          .
        </p>
      </Container>
    </>
  );
}
