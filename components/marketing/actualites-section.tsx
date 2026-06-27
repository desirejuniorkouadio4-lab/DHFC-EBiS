import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { Rail, RailItem } from "@/components/ui/rail";
import { ActualiteCard } from "./actualite-card";
import { getActualites } from "@/lib/content";

/** Section « Actualités » — 3 dernières (§9.3). */
export async function ActualitesSection() {
  const actualites = (await getActualites()).slice(0, 3);
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            align="left"
            eyebrow="Actualités"
            title="Les dernières nouvelles du dispositif"
            className="max-w-xl"
          />
          <Button href="/actualites" variant="outline" className="hidden shrink-0 sm:inline-flex">
            Toutes les actualités
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        <Rail className="mt-12" cols="lg:grid-cols-3">
          {actualites.map((a) => (
            <RailItem key={a.slug}>
              <ActualiteCard actualite={a} />
            </RailItem>
          ))}
        </Rail>
      </Container>
    </section>
  );
}
