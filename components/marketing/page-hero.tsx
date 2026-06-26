import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/motion/reveal";

type Crumb = { label: string; href?: string };

type PageHeroProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumb?: Crumb[];
  children?: React.ReactNode;
};

/** En-tête standardisé des pages internes (avec fil d'Ariane). */
export function PageHero({ eyebrow, title, description, breadcrumb, children }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)] pb-10 pt-28 sm:pb-16 sm:pt-40">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid opacity-60" />
        <div className="absolute -right-20 top-10 h-64 w-64 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-green-400/10 blur-3xl" />
      </div>

      <Container>
        {breadcrumb && (
          <Reveal>
            <nav aria-label="Fil d'Ariane" className="mb-4 sm:mb-6">
              <ol className="flex flex-wrap items-center gap-1.5 text-xs text-[var(--text-secondary)] sm:text-sm">
                {breadcrumb.map((crumb, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    {crumb.href ? (
                      <Link href={crumb.href} className="hover:text-orange-600">
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-primary)]">{crumb.label}</span>
                    )}
                    {i < breadcrumb.length - 1 && <ChevronRight className="h-3.5 w-3.5" />}
                  </li>
                ))}
              </ol>
            </nav>
          </Reveal>
        )}

        <div className="max-w-3xl">
          {eyebrow && (
            <Reveal>
              <Badge>{eyebrow}</Badge>
            </Reveal>
          )}
          <Reveal delay={0.05}>
            <h1 className="mt-3 text-balance text-3xl font-extrabold tracking-tight sm:mt-4 sm:text-5xl">
              {title}
            </h1>
          </Reveal>
          {description && (
            <Reveal delay={0.1}>
              <p className="mt-4 text-balance text-base leading-relaxed text-[var(--text-secondary)] sm:mt-5 sm:text-lg">
                {description}
              </p>
            </Reveal>
          )}
          {children && (
            <Reveal delay={0.15}>
              <div className="mt-8">{children}</div>
            </Reveal>
          )}
        </div>
      </Container>
    </section>
  );
}
