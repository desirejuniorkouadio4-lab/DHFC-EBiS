import { ArrowRight, UserCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

/** Section CTA finale « Vous êtes tuteur ? » (§9.3). */
export function CtaFinal() {
  return (
    <section className="py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-8 py-16 text-center text-white sm:px-16 sm:py-20">
            {/* Décor */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-green-500/30 blur-3xl" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_55%)]" />
            </div>

            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur">
                <UserCheck className="h-3.5 w-3.5" />
                Vous êtes tuteur ou encadreur ?
              </span>
              <h2 className="mt-6 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
                Rejoignez la communauté qui transforme l'enseignement des sciences
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-balance text-base text-white/85 sm:text-lg">
                Accompagnez vos cohortes, suivez leurs progrès et faites partie du
                réseau national de formateurs DHFC-EBiS.
              </p>
              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button href="/connexion" variant="white" size="lg">
                  Accéder à mon espace
                  <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
                </Button>
                <Button
                  href="/contact"
                  size="lg"
                  className="border border-white/30 bg-white/10 text-white hover:bg-white/20"
                >
                  Nous contacter
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
