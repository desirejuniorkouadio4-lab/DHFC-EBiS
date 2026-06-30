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
import { getTemoignages } from "@/lib/content";
import { getSessionUser } from "@/lib/auth-helpers";
import { roleHomePath } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [temoignages, user] = await Promise.all([getTemoignages(), getSessionUser()]);
  const homeHref = user ? roleHomePath(user.role) : undefined;
  return (
    <>
      <JsonLd />
      <Hero homeHref={homeHref} />
      <Stats />
      <Mission />
      <Hybride />
      <ParcoursSection />
      <Etapes />
      <Formats />
      <Temoignages temoignages={temoignages} />
      <PartenairesSection />
      <ActualitesSection />
      <CtaFinal />
    </>
  );
}
