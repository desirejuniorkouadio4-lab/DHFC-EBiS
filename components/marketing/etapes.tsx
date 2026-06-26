import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, RevealItem } from "@/components/motion/reveal";
import { ETAPES } from "@/lib/data";

/** « Votre parcours en 4 étapes » — timeline (§9.3). */
export function Etapes() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Comment ça marche"
          tone="green"
          title="Votre parcours en 4 étapes"
          description="De l'activation de votre compte à l'obtention de votre certificat, un cheminement clair et accompagné."
        />

        <div className="relative mt-16">
          {/* Ligne de connexion */}
          <div
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-orange-300 via-green-400 to-orange-300 lg:block"
            aria-hidden
          />
          <Stagger className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4" staggerChildren={0.15}>
            {ETAPES.map((etape) => (
              <RevealItem key={etape.step}>
                <div className="relative flex flex-col items-center text-center lg:items-start lg:text-left">
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-primary)] font-display text-xl font-extrabold text-orange-600 ring-2 ring-orange-500 ring-offset-4 ring-offset-[var(--bg-primary)]">
                    {etape.step}
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{etape.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                    {etape.description}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Stagger>
        </div>
      </Container>
    </section>
  );
}
