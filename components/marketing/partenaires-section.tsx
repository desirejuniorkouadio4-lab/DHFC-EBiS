import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PartenairesMarquee } from "@/components/marketing/partenaires-marquee";
import { getPartenaires } from "@/lib/content";

/** Section « Partenaires » avec défilement automatique continu. */
export async function PartenairesSection() {
  const partenaires = await getPartenaires();
  return (
    <section className="bg-[var(--bg-secondary)] py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Une initiative soutenue"
          title="Nos partenaires institutionnels et financiers"
          description="Le DHFC-EBiS est porté par la DPFC sous tutelle du MENAET, avec le soutien de partenaires nationaux et internationaux."
        />
        <PartenairesMarquee partenaires={partenaires} />
      </Container>
    </section>
  );
}
