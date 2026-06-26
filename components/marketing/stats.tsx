import { Container } from "@/components/ui/container";
import { CountUp } from "@/components/motion/count-up";
import { STATS } from "@/lib/data";

/** Bandeau « Chiffres clés » avec compteurs animés (§9.3). */
export function Stats() {
  return (
    <section className="relative border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-16 sm:py-20">
      <Container>
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-orange-600">
            Le dispositif en chiffres
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Un impact à l'échelle nationale
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6 lg:gap-6">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4 text-center transition-colors lg:border-transparent lg:bg-transparent lg:hover:border-[var(--border-subtle)] lg:hover:bg-[var(--bg-elevated)]"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600 transition-transform group-hover:scale-110 dark:bg-orange-500/10 dark:text-orange-400 sm:h-11 sm:w-11">
                <stat.icon className="h-5 w-5" />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight sm:text-4xl">
                <CountUp value={stat.value} suffix={stat.suffix} />
              </span>
              <span className="text-xs font-medium leading-tight text-[var(--text-secondary)]">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
