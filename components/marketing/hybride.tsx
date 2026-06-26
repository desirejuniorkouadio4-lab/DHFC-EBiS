import { MapPin, Wifi, Library, ArrowRight, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Reveal, Stagger, RevealItem } from "@/components/motion/reveal";

const CHALLENGES = [
  {
    icon: MapPin,
    title: "Éloignement géographique",
    text: "Des enseignants répartis sur 613 collèges, parfois à plusieurs heures des centres de formation.",
  },
  {
    icon: Wifi,
    title: "Connexion limitée",
    text: "Des zones où la connexion internet est instable, lente ou simplement absente.",
  },
  {
    icon: Library,
    title: "Ressources rares",
    text: "Un accès inégal aux ressources pédagogiques et aux formateurs spécialisés.",
  },
];

const SOLUTIONS = [
  "Chaque module disponible en ligne, hors-ligne et en version imprimable",
  "Un tuteur attitré pour un accompagnement humain de proximité",
  "Une plateforme optimisée pour la 3G et les connexions limitées",
  "Une formation à votre rythme, sans quitter votre classe",
];

/** Storytelling « Pourquoi un dispositif hybride » (§9.3). */
export function Hybride() {
  return (
    <section className="relative overflow-hidden bg-neutral-950 py-20 text-white sm:py-28">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/4 top-0 h-72 w-72 rounded-full bg-orange-500/20 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-72 w-72 rounded-full bg-green-500/15 blur-3xl" />
      </div>

      <Container>
        <div className="grid items-center gap-14 lg:grid-cols-2">
          {/* Le défi */}
          <div>
            <Reveal>
              <Badge tone="orange">Le défi terrain</Badge>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="mt-4 text-balance text-3xl font-bold tracking-tight sm:text-4xl">
                Former partout, malgré les contraintes
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-4 max-w-md text-base leading-relaxed text-white/60">
                La formation continue des enseignants en Côte d'Ivoire se heurte
                à trois réalités concrètes. Le dispositif hybride est né pour les
                dépasser.
              </p>
            </Reveal>

            <Stagger className="mt-8 space-y-3" staggerChildren={0.12}>
              {CHALLENGES.map((c) => (
                <RevealItem key={c.title}>
                  <div className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-colors hover:bg-white/[0.06]">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                      <c.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-semibold">{c.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-white/55">{c.text}</p>
                    </div>
                  </div>
                </RevealItem>
              ))}
            </Stagger>
          </div>

          {/* La solution */}
          <Reveal delay={0.15}>
            <div className="relative rounded-3xl border border-green-500/20 bg-gradient-to-br from-green-500/10 to-orange-500/5 p-8 sm:p-10">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-green-500/15 px-4 py-1.5 text-xs font-semibold text-green-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
                </span>
                La réponse hybride
              </div>
              <h3 className="text-2xl font-bold sm:text-3xl">
                Un module, <span className="text-gradient-orange">trois formats</span>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-white/60">
                Hybridité réelle : en ligne, hors-ligne et papier. Chacun choisit
                le mode qui correspond à sa situation.
              </p>

              <ul className="mt-7 space-y-3.5">
                {SOLUTIONS.map((s) => (
                  <li key={s} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500 text-white">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm leading-relaxed text-white/85">{s}</span>
                  </li>
                ))}
              </ul>

              <a
                href="/mission"
                className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-orange-400 hover:text-orange-300"
              >
                Comprendre notre approche pédagogique
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
