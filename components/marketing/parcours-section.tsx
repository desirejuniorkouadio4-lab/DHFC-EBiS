import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Rail, RailItem } from "@/components/ui/rail";
import { ParcoursCard } from "./parcours-card";
import { getFeaturedParcours } from "@/lib/content";

/** Section « Les parcours » sur la home — aperçu du catalogue (§9.3). */
export async function ParcoursSection() {
  const featured = await getFeaturedParcours(3);

  return (
    <section className="bg-[var(--bg-secondary)] py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Catalogue"
            title="Des parcours conçus par et pour les enseignants"
            description="Chaque parcours mêle apports disciplinaires, pédagogie active et mise en pratique immédiate en classe."
            className="max-w-xl"
          />
          <Button href="/parcours" variant="outline" className="hidden shrink-0 sm:inline-flex">
            Voir tous les parcours
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Rail className="mt-8 sm:mt-12" cols="lg:grid-cols-3">
          {featured.map((p) => (
            <RailItem key={p.slug} width="w-[66%] sm:w-[44%]">
              <ParcoursCard parcours={p} />
            </RailItem>
          ))}
        </Rail>

        <div className="mt-10 text-center sm:hidden">
          <Button href="/parcours" variant="outline">
            Voir tous les parcours
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </Container>
    </section>
  );
}
