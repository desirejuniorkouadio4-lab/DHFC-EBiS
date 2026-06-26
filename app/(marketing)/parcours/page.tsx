import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/page-hero";
import { ParcoursCatalogue } from "@/components/marketing/parcours-catalogue";

export const metadata: Metadata = {
  title: "Catalogue des parcours",
  description:
    "Explorez les parcours de formation continue du DHFC-EBiS : mathématiques, TICE, physique-chimie et SVT.",
};

export default function ParcoursPage() {
  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Tous les parcours de formation"
        description="Des parcours pensés pour les enseignants bivalents de sciences, ancrés dans la pratique de classe et disponibles dans les trois formats hybrides."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Parcours" }]}
      />
      <ParcoursCatalogue />
    </>
  );
}
