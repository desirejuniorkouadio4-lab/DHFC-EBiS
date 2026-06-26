import { GraduationCap, TrendingUp, Sparkles, type LucideIcon } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, RevealItem } from "@/components/motion/reveal";
import { MISSIONS } from "@/lib/data";

const ICONS: Record<string, LucideIcon> = {
  GraduationCap,
  TrendingUp,
  Sparkles,
};

/** Section « Notre mission » en 3 cartes (§9.3). */
export function Mission() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Notre mission"
          title={<>Trois engagements au service de l'école ivoirienne</>}
          description="Le DHFC-EBiS accompagne les enseignants bivalents de sciences tout au long de leur carrière, avec une exigence : améliorer concrètement les apprentissages."
        />

        <Stagger className="mt-10 grid gap-4 sm:mt-14 sm:gap-6 md:grid-cols-3">
          {MISSIONS.map((mission, i) => {
            const Icon = ICONS[mission.icon] ?? Sparkles;
            return (
              <RevealItem key={mission.title}>
                <article className="group relative h-full overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8">
                  <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-orange-500/5 transition-transform duration-500 group-hover:scale-150" />
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-400 text-white shadow-brand sm:h-14 sm:w-14">
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </span>
                  <h3 className="relative mt-5 flex items-baseline gap-2 text-xl font-bold sm:mt-6 sm:text-2xl">
                    {mission.title}
                    <span className="font-display text-sm font-bold text-orange-300">
                      0{i + 1}
                    </span>
                  </h3>
                  <p className="relative mt-2 text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-3">
                    {mission.description}
                  </p>
                </article>
              </RevealItem>
            );
          })}
        </Stagger>
      </Container>
    </section>
  );
}
