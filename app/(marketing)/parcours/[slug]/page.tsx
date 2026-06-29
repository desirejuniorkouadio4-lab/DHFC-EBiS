import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Star,
  Clock,
  Layers,
  Users,
  BarChart3,
  Award,
  Check,
  Target,
  ListChecks,
  ArrowRight,
  Globe,
  Smartphone,
  Printer,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { ParcoursCard } from "@/components/marketing/parcours-card";
import { ProgrammeAccordion } from "@/components/marketing/programme-accordion";
import { DISCIPLINES } from "@/lib/data";
import { getParcoursBySlug, getSimilarParcours } from "@/lib/content";
import { formatNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const parcours = await getParcoursBySlug(slug);
  if (!parcours) return { title: "Parcours introuvable" };
  return {
    title: parcours.title,
    description: parcours.description,
  };
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const parcours = await getParcoursBySlug(slug);
  if (!parcours) notFound();

  const discipline = DISCIPLINES.find((d) => d.slug === parcours.disciplineSlug);
  const Icon = discipline?.icon;
  const programme = parcours.programme;
  const recommended = await getSimilarParcours(slug, parcours.disciplineSlug, 3);

  return (
    <>
      {/* Cover */}
      <section
        className="relative overflow-hidden border-b border-[var(--border-subtle)] pb-12 pt-32 sm:pt-40"
        style={{
          background: `linear-gradient(135deg, ${discipline?.color}18, transparent 60%)`,
        }}
      >
        <div className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-50" />
        {Icon && (
          <Icon
            className="pointer-events-none absolute -right-10 top-24 h-72 w-72 opacity-[0.07]"
            style={{ color: discipline?.color }}
          />
        )}
        <Container>
          <nav aria-label="Fil d'Ariane" className="mb-6 text-sm text-[var(--text-secondary)]">
            <Link href="/" className="hover:text-orange-600">Accueil</Link>
            <span className="mx-1.5">/</span>
            <Link href="/parcours" className="hover:text-orange-600">Parcours</Link>
            <span className="mx-1.5">/</span>
            <span className="text-[var(--text-primary)]">{discipline?.short}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge tone="orange">
                {Icon && <Icon className="h-3.5 w-3.5" />}
                {discipline?.name}
              </Badge>
              <Badge tone="green">Bivalence {discipline?.bivalence}</Badge>
              {parcours.isNew && <Badge tone="neutral">Nouveau</Badge>}
            </div>

            <h1 className="mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              {parcours.title}
            </h1>
            <p className="mt-4 text-balance text-lg text-[var(--text-secondary)]">
              {parcours.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <span className="inline-flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                <strong>{parcours.rating.toFixed(1)}</strong>
                <span className="text-[var(--text-secondary)]">
                  ({formatNumber(parcours.reviews)} avis)
                </span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                <Users className="h-4 w-4" /> {formatNumber(parcours.enrolled)} inscrits
              </span>
              <span className="inline-flex items-center gap-1.5 text-[var(--text-secondary)]">
                <BarChart3 className="h-4 w-4" /> Niveau {parcours.level}
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* Corps : 2 colonnes */}
      <Container className="py-10 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:gap-12">
          {/* Colonne principale */}
          <div className="order-2 min-w-0 space-y-10 lg:order-1 lg:space-y-12">
            <Reveal>
              <div>
                <h2 className="text-2xl font-bold">À propos de ce parcours</h2>
                <p className="mt-4 leading-relaxed text-[var(--text-secondary)]">
                  {parcours.description}
                </p>
              </div>
            </Reveal>

            {/* Objectifs */}
            <Reveal>
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <Target className="h-6 w-6 text-orange-500" />
                  Objectifs pédagogiques
                </h2>
                <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                  {parcours.objectives.map((obj) => (
                    <li
                      key={obj}
                      className="flex items-start gap-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <span className="text-sm leading-relaxed">{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Prérequis */}
            <Reveal>
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold">
                  <ListChecks className="h-6 w-6 text-orange-500" />
                  Prérequis
                </h2>
                <ul className="mt-4 space-y-2">
                  {parcours.prerequisites.map((pre) => (
                    <li key={pre} className="flex items-center gap-3 text-[var(--text-secondary)]">
                      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                      {pre}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* Programme */}
            <Reveal>
              <div>
                <div className="flex items-end justify-between">
                  <h2 className="flex items-center gap-2 text-2xl font-bold">
                    <Layers className="h-6 w-6 text-orange-500" />
                    Programme détaillé
                  </h2>
                  <span className="text-sm text-[var(--text-secondary)]">
                    {parcours.modules} modules · {parcours.lessons} leçons
                  </span>
                </div>
                <div className="mt-5">
                  <ProgrammeAccordion modules={programme} />
                </div>
              </div>
            </Reveal>
          </div>

          {/* Carte d'inscription (sticky desktop, en tête sur mobile) */}
          <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-lg">
              {parcours.coverUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={parcours.coverUrl} alt={parcours.title} className="aspect-[16/9] w-full object-cover" />
              ) : (
                <div
                  className="flex aspect-[16/9] items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${discipline?.color}22, ${discipline?.color}08)`,
                  }}
                >
                  {Icon && <Icon className="h-16 w-16" style={{ color: discipline?.color }} />}
                </div>
              )}
              <div className="p-6">
                <dl className="space-y-3 text-sm">
                  <Row icon={Clock} label="Durée estimée" value={`${parcours.durationHours} heures`} />
                  <Row icon={Layers} label="Modules" value={`${parcours.modules} modules`} />
                  <Row icon={BarChart3} label="Niveau" value={parcours.level} />
                  <Row icon={Award} label="Certificat" value="Délivré par la DPFC" />
                </dl>

                <div className="mt-5 flex flex-wrap gap-2 border-y border-[var(--border-subtle)] py-4">
                  <FormatPill icon={Globe} label="En ligne" />
                  <FormatPill icon={Smartphone} label="Hors-ligne" />
                  <FormatPill icon={Printer} label="PDF" />
                </div>

                <Button href="/connexion" size="lg" className="mt-5 w-full">
                  S'inscrire au parcours
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <p className="mt-3 text-center text-xs text-[var(--text-secondary)]">
                  Accès réservé aux enseignants des cohortes DHFC-EBiS.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </Container>

      {/* Parcours similaires */}
      {recommended.length > 0 && (
        <section className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] py-16">
          <Container>
            <h2 className="text-2xl font-bold">Parcours similaires</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recommended.map((p) => (
                <ParcoursCard key={p.slug} parcours={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className="inline-flex items-center gap-2 text-[var(--text-secondary)]">
        <Icon className="h-4 w-4" />
        {label}
      </dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}

function FormatPill({ icon: Icon, label }: { icon: typeof Globe; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
      <Icon className="h-3.5 w-3.5 text-orange-500" />
      {label}
    </span>
  );
}
