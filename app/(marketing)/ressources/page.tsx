import type { Metadata } from "next";
import { FileText, Download, BookOpen, FileBox, Video, GraduationCap } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Stagger, RevealItem } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Ressources",
  description:
    "Bibliothèque publique du DHFC-EBiS : guides de formation, documents pédagogiques et modules ePoc.",
};

const RESSOURCES = [
  { icon: BookOpen, title: "Guide de l'enseignant bivalent", type: "PDF", size: "2,4 Mo", cat: "Guide" },
  { icon: FileText, title: "Référentiel de compétences scientifiques", type: "PDF", size: "1,1 Mo", cat: "Référentiel" },
  { icon: FileBox, title: "Module ePoc — Démarche d'investigation", type: "ePoc", size: "8,7 Mo", cat: "Module" },
  { icon: Video, title: "Tutoriel — Prise en main de la plateforme", type: "Vidéo", size: "—", cat: "Tutoriel" },
  { icon: GraduationCap, title: "Charte du tutorat DHFC-EBiS", type: "PDF", size: "640 Ko", cat: "Guide" },
  { icon: FileText, title: "Modèle de séquence pédagogique hybride", type: "DOCX", size: "320 Ko", cat: "Modèle" },
];

export default function RessourcesPage() {
  return (
    <>
      <PageHero
        eyebrow="Bibliothèque"
        title="Ressources en libre accès"
        description="Guides, référentiels, modules ePoc et tutoriels à télécharger librement pour accompagner votre pratique."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Ressources" }]}
      />

      <Container className="py-16 sm:py-20">
        <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.08}>
          {RESSOURCES.map((r) => (
            <RevealItem key={r.title}>
              <article className="group flex h-full flex-col rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                    <r.icon className="h-6 w-6" />
                  </span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                    {r.cat}
                  </span>
                </div>
                <h3 className="mt-5 flex-1 text-lg font-bold leading-snug">{r.title}</h3>
                <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-sm">
                  <span className="text-[var(--text-secondary)]">
                    {r.type} · {r.size}
                  </span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1.5 font-semibold text-orange-600 transition-colors hover:text-orange-700"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger
                  </button>
                </div>
              </article>
            </RevealItem>
          ))}
        </Stagger>

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
