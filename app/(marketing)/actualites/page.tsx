import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { ActualiteCard } from "@/components/marketing/actualite-card";
import { Stagger, RevealItem } from "@/components/motion/reveal";
import { getActualites } from "@/lib/content";

export const metadata: Metadata = {
  title: "Actualités",
  description: "Toutes les actualités du dispositif de formation continue DHFC-EBiS.",
};

export const dynamic = "force-dynamic";

export default async function ActualitesPage() {
  const actualites = await getActualites();
  return (
    <>
      <PageHero
        eyebrow="Actualités"
        title="Les nouvelles du dispositif"
        description="Lancements de cohortes, nouveautés produit, partenariats : suivez la vie du dispositif DHFC-EBiS."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Actualités" }]}
      />

      <Container className="py-10 sm:py-16">
        <Stagger className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3" staggerChildren={0.08}>
          {actualites.map((a) => (
            <RevealItem key={a.slug}>
              <ActualiteCard actualite={a} />
            </RevealItem>
          ))}
        </Stagger>
      </Container>
    </>
  );
}
