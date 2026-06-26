import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { CtaFinal } from "@/components/marketing/cta-final";
import { PARTENAIRES } from "@/lib/data";

export const metadata: Metadata = {
  title: "Partenaires",
  description:
    "Les partenaires institutionnels et financiers du dispositif DHFC-EBiS : MENAET, DPFC, IGENAET, DTSI, AUF, AFD.",
};

const GROUPS = [
  {
    title: "Partenaires institutionnels",
    description: "Les acteurs publics ivoiriens qui portent et encadrent le dispositif.",
    acronyms: ["MENAET", "DPFC", "IGENAET", "DTSI"],
  },
  {
    title: "Partenaires internationaux",
    description: "Le soutien technique et financier qui permet le déploiement à l'échelle.",
    acronyms: ["AUF", "AFD"],
  },
];

export default function PartenairesPage() {
  return (
    <>
      <PageHero
        eyebrow="Ils nous soutiennent"
        title="Une alliance au service des enseignants"
        description="Le DHFC-EBiS rassemble des partenaires nationaux et internationaux autour d'un objectif commun : la qualité de l'enseignement des sciences en Côte d'Ivoire."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Partenaires" }]}
      />

      <section className="space-y-16 py-16 sm:py-24">
        {GROUPS.map((group) => (
          <Container key={group.title}>
            <Reveal>
              <div className="max-w-2xl">
                <h2 className="text-2xl font-bold sm:text-3xl">{group.title}</h2>
                <p className="mt-3 text-[var(--text-secondary)]">{group.description}</p>
              </div>
            </Reveal>
            <Stagger className="mt-8 grid gap-6 sm:grid-cols-2" staggerChildren={0.1}>
              {group.acronyms.map((acr) => {
                const p = PARTENAIRES.find((x) => x.acronym === acr);
                if (!p) return null;
                return (
                  <RevealItem key={acr}>
                    <article className="group flex h-full items-start gap-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                      <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/10 to-green-500/10 font-display text-lg font-extrabold text-orange-600">
                        {p.acronym.slice(0, 3)}
                      </span>
                      <div>
                        <h3 className="font-display text-xl font-extrabold">{p.acronym}</h3>
                        <p className="mt-1 text-sm font-medium text-orange-600">{p.role}</p>
                        <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          {p.name}
                        </p>
                      </div>
                    </article>
                  </RevealItem>
                );
              })}
            </Stagger>
          </Container>
        ))}
      </section>

      <CtaFinal />
    </>
  );
}
