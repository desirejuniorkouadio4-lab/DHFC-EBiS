import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleQuestion } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { FaqAccordion } from "@/components/marketing/faq-accordion";
import { Reveal } from "@/components/motion/reveal";
import { FAQ } from "@/lib/data";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Trouvez des réponses aux questions les plus fréquentes sur le dispositif DHFC-EBiS.",
};

/** Données structurées FAQPage pour le SEO (§9.4). */
function FaqJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.flatMap((cat) =>
      cat.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      }))
    ),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export default function FaqPage() {
  let offset = 0;
  return (
    <>
      <FaqJsonLd />
      <PageHero
        eyebrow="Aide"
        title="Questions fréquentes"
        description="Tout ce que vous devez savoir sur l'accès, les parcours et l'accompagnement du dispositif DHFC-EBiS."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "FAQ" }]}
      />

      <Container className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl space-y-12">
          {FAQ.map((cat) => {
            const start = offset;
            offset += cat.items.length;
            return (
              <Reveal key={cat.category}>
                <div>
                  <h2 className="mb-5 text-xl font-bold">{cat.category}</h2>
                  <FaqAccordion items={cat.items} startIndex={start} />
                </div>
              </Reveal>
            );
          })}

          <Reveal>
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-10 text-center">
              <MessageCircleQuestion className="h-10 w-10 text-orange-500" />
              <h3 className="text-xl font-bold">Vous ne trouvez pas votre réponse ?</h3>
              <p className="max-w-md text-sm text-[var(--text-secondary)]">
                Notre équipe support est disponible pour vous accompagner.
              </p>
              <Link
                href="/contact"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-orange-500 px-6 text-sm font-semibold text-white shadow-brand transition-all hover:-translate-y-0.5 hover:bg-orange-600"
              >
                Contacter le support
              </Link>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
