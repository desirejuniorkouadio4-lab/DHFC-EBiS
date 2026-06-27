import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Rail, RailItem } from "@/components/ui/rail";
import { getPartenaires } from "@/lib/content";

/** Section « Partenaires » avec effets au survol (§9.3). */
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

        <Rail className="mt-14" cols="lg:grid-cols-6 lg:gap-4">
          {partenaires.map((p) => (
            <RailItem key={p.acronym} width="w-[42%] sm:w-[30%]">
              <div
                title={p.name}
                className="group flex h-full flex-col items-center justify-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg"
              >
                <span className="font-display text-xl font-extrabold tracking-tight text-neutral-400 transition-colors group-hover:text-orange-600">
                  {p.acronym}
                </span>
                <span className="text-[11px] leading-tight text-[var(--text-secondary)]">
                  {p.role}
                </span>
              </div>
            </RailItem>
          ))}
        </Rail>
      </Container>
    </section>
  );
}
