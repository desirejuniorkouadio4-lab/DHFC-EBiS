import { Hero } from "@/components/marketing/hero";
import { Stats } from "@/components/marketing/stats";
import { Mission } from "@/components/marketing/mission";
import { Hybride } from "@/components/marketing/hybride";
import { ParcoursSection } from "@/components/marketing/parcours-section";
import { Etapes } from "@/components/marketing/etapes";
import { Formats } from "@/components/marketing/formats";
import { Temoignages } from "@/components/marketing/temoignages";
import { PartenairesSection } from "@/components/marketing/partenaires-section";
import { ActualitesSection } from "@/components/marketing/actualites-section";
import { CtaFinal } from "@/components/marketing/cta-final";
import { JsonLd } from "@/components/seo/json-ld";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Hero />
      <Stats />
      <Mission />
      <Hybride />
      <ParcoursSection />
      <Etapes />
      <Formats />
      <Temoignages />
      <PartenairesSection />
      <ActualitesSection />
      <CtaFinal />
    </>
  );
}
