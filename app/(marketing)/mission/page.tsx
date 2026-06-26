import type { Metadata } from "next";
import {
  ShieldCheck,
  Layers,
  GraduationCap,
  Gauge,
  Accessibility,
  MapPin,
  Quote,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";
import { CtaFinal } from "@/components/marketing/cta-final";

export const metadata: Metadata = {
  title: "Notre mission",
  description:
    "La vision, les principes directeurs et la gouvernance du dispositif DHFC-EBiS.",
};

const PRINCIPES = [
  {
    icon: ShieldCheck,
    title: "Souveraineté",
    text: "Une stack open source et un hébergement maîtrisable, sans dépendance bloquante à un éditeur unique.",
  },
  {
    icon: Layers,
    title: "Hybridité réelle",
    text: "Chaque module disponible en ligne, hors-ligne et sur papier — pour s'adapter à toutes les situations.",
  },
  {
    icon: GraduationCap,
    title: "Pédagogie d'abord",
    text: "Une plateforme repensée autour du parcours apprenant, et non des contraintes d'un outil.",
  },
  {
    icon: Gauge,
    title: "Performance terrain",
    text: "Optimisé pour la 3G et les connexions limitées, avec des contenus légers et rapides à charger.",
  },
  {
    icon: Accessibility,
    title: "Inclusivité",
    text: "Conforme au RGAA 4.1 et aux WCAG 2.2 AA : accessible à toutes et à tous.",
  },
  {
    icon: MapPin,
    title: "Made in Côte d'Ivoire",
    text: "Conçu, développé et maintenu en Côte d'Ivoire, par et pour les acteurs ivoiriens.",
  },
];

const GOUVERNANCE = [
  { role: "Tutelle", who: "MENAET", desc: "Ministère de l'Éducation Nationale, de l'Alphabétisation et de l'Enseignement Technique" },
  { role: "Pilotage", who: "DPFC", desc: "Direction de la Pédagogie et de la Formation Continue — porteur du dispositif" },
  { role: "Supervision", who: "IGENAET", desc: "Inspection Générale, garante de la qualité pédagogique" },
  { role: "Technique", who: "DTSI", desc: "Direction des Technologies et des Systèmes d'Information" },
];

export default function MissionPage() {
  return (
    <>
      <PageHero
        eyebrow="Notre mission"
        title="Faire de la formation continue un levier d'égalité"
        description="DHFC-EBiS ambitionne de devenir la première plateforme nationale de formation continue d'Afrique francophone, à la croisée d'une vitrine institutionnelle premium et d'un LMS de niveau international."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Mission" }]}
      />

      {/* Vision */}
      <section className="py-16 sm:py-24">
        <Container>
          <Reveal>
            <figure className="mx-auto max-w-4xl text-center">
              <Quote className="mx-auto h-12 w-12 text-orange-500/30" />
              <blockquote className="mt-6 text-balance text-2xl font-bold leading-snug sm:text-3xl lg:text-4xl">
                « Repenser la formation des enseignants de sciences pour les
                réalités du terrain ivoirien — en ligne, hors-ligne et partout. »
              </blockquote>
              <figcaption className="mt-6 text-sm font-medium text-[var(--text-secondary)]">
                — Vision DHFC-EBiS v2
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      {/* Principes directeurs */}
      <section className="bg-[var(--bg-secondary)] py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Nos principes directeurs"
            title="Six engagements qui guident chaque décision"
            description="Du choix technique à l'expérience utilisateur, ces principes structurent l'ensemble du dispositif."
          />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerChildren={0.08}>
            {PRINCIPES.map((p) => (
              <RevealItem key={p.title}>
                <article className="group h-full rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition-colors group-hover:bg-orange-500 group-hover:text-white dark:bg-orange-500/10">
                    <p.icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-5 text-lg font-bold">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {p.text}
                  </p>
                </article>
              </RevealItem>
            ))}
          </Stagger>
        </Container>
      </section>

      {/* Gouvernance */}
      <section className="py-20 sm:py-28">
        <Container>
          <SectionHeading
            eyebrow="Gouvernance"
            tone="green"
            title="Un dispositif piloté au plus haut niveau"
            description="Le DHFC-EBiS s'appuie sur une gouvernance institutionnelle claire, garante de sa pérennité et de sa qualité."
          />
          <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" staggerChildren={0.1}>
            {GOUVERNANCE.map((g) => (
              <RevealItem key={g.who}>
                <div className="flex h-full flex-col rounded-3xl border border-[var(--border-subtle)] p-6">
                  <span className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                    {g.role}
                  </span>
                  <span className="mt-2 font-display text-2xl font-extrabold">{g.who}</span>
                  <span className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {g.desc}
                  </span>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </Container>
      </section>

      <CtaFinal />
    </>
  );
}
