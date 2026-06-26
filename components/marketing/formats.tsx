import { Globe, Smartphone, Printer, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";

const FORMATS = [
  {
    icon: Globe,
    title: "En ligne",
    tag: "Web",
    description:
      "L'expérience complète : vidéos, exercices interactifs, quiz auto-corrigés, forums et tutorat en temps réel.",
    points: ["Streaming adaptatif 3G/4G", "Suivi de progression", "Communauté & tuteurs"],
    accent: "#f39200",
  },
  {
    icon: Smartphone,
    title: "Hors-ligne",
    tag: "ePoc · PWA",
    description:
      "Téléchargez vos modules au format ePoc et suivez-les sans connexion. La progression se synchronise au retour en ligne.",
    points: ["Application installable", "Format ouvert INRIA", "Synchronisation automatique"],
    accent: "#009640",
    featured: true,
  },
  {
    icon: Printer,
    title: "Papier",
    tag: "PDF",
    description:
      "Chaque module est exportable en PDF imprimable, mise en page sobre, avec exercices et corrigés.",
    points: ["Format A4 imprimable", "Exercices + corrigés", "Aucun équipement requis"],
    accent: "#52525b",
  },
];

/** Section « 3 formats : En ligne · ePoc · PDF » (§9.3). */
export function Formats() {
  return (
    <section className="bg-[var(--bg-secondary)] py-20 sm:py-28">
      <Container>
        <SectionHeading
          eyebrow="Hybridité réelle"
          title={<>Un seul contenu, <span className="text-gradient-orange">trois manières</span> d'apprendre</>}
          description="Parce que chaque enseignant a sa réalité, chaque module est disponible dans les trois formats — sans compromis sur la qualité."
        />

        <div className="mt-8 grid grid-cols-3 gap-2.5 pt-3 sm:mt-14 sm:gap-6">
          {FORMATS.map((format) => (
            <article
              key={format.title}
              className={`group relative flex h-full flex-col items-center rounded-2xl border p-3 text-center transition-all duration-300 sm:items-stretch sm:rounded-3xl sm:p-8 sm:text-left sm:hover:-translate-y-1.5 sm:hover:shadow-xl ${
                format.featured
                  ? "border-green-500/40 bg-[var(--bg-elevated)] sm:shadow-lg sm:ring-1 sm:ring-green-500/10"
                  : "border-[var(--border-subtle)] bg-[var(--bg-elevated)]"
              }`}
            >
              {format.featured && (
                <span className="absolute -top-3 left-8 hidden rounded-full bg-green-500 px-3 py-1 text-xs font-bold text-white sm:block">
                  Recommandé terrain
                </span>
              )}
              <div className="flex w-full items-center justify-center sm:justify-between">
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-lg sm:h-14 sm:w-14 sm:rounded-2xl"
                  style={{ backgroundColor: format.accent }}
                >
                  <format.icon className="h-5 w-5 sm:h-7 sm:w-7" />
                </span>
                <span className="hidden rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 sm:inline-block">
                  {format.tag}
                </span>
              </div>
              <h3 className="mt-2.5 text-[13px] font-bold leading-tight sm:mt-6 sm:text-2xl">
                {format.title}
              </h3>
              <span className="mt-1 text-[10px] font-medium text-[var(--text-secondary)] sm:hidden">
                {format.tag}
              </span>
              <p className="hidden text-sm leading-relaxed text-[var(--text-secondary)] sm:mt-3 sm:block">
                {format.description}
              </p>
              <ul className="mt-5 hidden space-y-2.5 border-t border-[var(--border-subtle)] pt-5 sm:mt-6 sm:block sm:pt-6">
                {format.points.map((point) => (
                  <li key={point} className="flex items-center gap-2.5 text-sm">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${format.accent}1a`, color: format.accent }}
                    >
                      <Check className="h-3 w-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
