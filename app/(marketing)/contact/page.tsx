import type { Metadata } from "next";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { ContactForm } from "@/components/marketing/contact-form";
import { Reveal } from "@/components/motion/reveal";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contactez l'équipe du dispositif DHFC-EBiS.",
};

const COORDS = [
  { icon: Mail, label: "E-mail", value: "support@dhfc.dpfc.ci", href: "mailto:support@dhfc.dpfc.ci" },
  { icon: Phone, label: "Téléphone", value: "+225 27 20 00 00 00", href: "tel:+2252720000000" },
  { icon: MapPin, label: "Adresse", value: "DPFC, Plateau — Abidjan, Côte d'Ivoire" },
  { icon: Clock, label: "Horaires", value: "Lun – Ven · 8h – 17h (GMT)" },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Une question ? Parlons-en"
        description="Notre équipe est à votre écoute pour toute question sur le dispositif, votre accès ou un partenariat."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Contact" }]}
      />

      <Container className="py-10 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:gap-10">
          <Reveal>
            <ContactForm />
          </Reveal>

          <Reveal delay={0.1}>
            <div className="space-y-4">
              {COORDS.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-5"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                      {c.label}
                    </div>
                    {c.href ? (
                      <a href={c.href} className="mt-0.5 block font-medium hover:text-orange-600">
                        {c.value}
                      </a>
                    ) : (
                      <div className="mt-0.5 font-medium">{c.value}</div>
                    )}
                  </div>
                </div>
              ))}

              <div className="relative flex h-48 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
                <div className="absolute inset-0 bg-grid opacity-50" />
                <div className="relative flex flex-col items-center gap-2 text-[var(--text-secondary)]">
                  <MapPin className="h-7 w-7 text-orange-500" />
                  <span className="text-sm font-medium">Abidjan — Plateau</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </Container>
    </>
  );
}
