import Link from "next/link";
import { Mail, MapPin, Phone, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { NewsletterForm } from "@/components/marketing/newsletter-form";

const FOOTER_COLUMNS = [
  {
    title: "Le dispositif",
    links: [
      { href: "/mission", label: "Notre mission" },
      { href: "/partenaires", label: "Partenaires" },
      { href: "/actualites", label: "Actualités" },
      { href: "/temoignages", label: "Témoignages" },
    ],
  },
  {
    title: "Se former",
    links: [
      { href: "/parcours", label: "Catalogue des parcours" },
      { href: "/ressources", label: "Ressources" },
      { href: "/faq", label: "Questions fréquentes" },
      { href: "/connexion", label: "Espace apprenant" },
    ],
  },
  {
    title: "Légal",
    links: [
      { href: "/mentions-legales", label: "Mentions légales" },
      { href: "/confidentialite", label: "Confidentialité" },
      { href: "/cgu", label: "CGU" },
      { href: "/accessibilite", label: "Accessibilité" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] pb-bottom-nav lg:pb-0">
      <Container className="py-16">
        {/* Newsletter */}
        <div className="mb-12 grid gap-5 rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6 shadow-sm sm:gap-8 sm:p-8 lg:mb-14 lg:grid-cols-2 lg:items-center lg:p-10">
          <div>
            <h3 className="text-2xl font-bold tracking-tight">Restez informé</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              Recevez les actualités du dispositif, les nouveaux parcours et les
              ouvertures de cohortes directement dans votre boîte mail.
            </p>
          </div>
          <NewsletterForm />
        </div>

        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Marque + contact */}
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-[var(--text-secondary)]">
              Dispositif Hybride de Formation Continue des Enseignants Bivalents
              de Sciences. Une initiative de la DPFC — MENAET, République de Côte
              d'Ivoire.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-[var(--text-secondary)]">
              <li className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 shrink-0 text-orange-500" />
                Plateau, Abidjan — Côte d'Ivoire
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-orange-500" />
                <a href="mailto:support@dhfc.dpfc.ci" className="hover:text-orange-600">
                  support@dhfc.dpfc.ci
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-orange-500" />
                +225 27 20 00 00 00
              </li>
            </ul>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-primary)]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="group inline-flex items-center gap-1 text-sm text-[var(--text-secondary)] transition-colors hover:text-orange-600"
                    >
                      {link.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-[var(--border-subtle)] pt-8 text-sm text-[var(--text-secondary)] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} DHFC-EBiS — DPFC / MENAET. Tous droits réservés.</p>
          <p className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-500" />
            Conçu et maintenu en Côte d'Ivoire
          </p>
        </div>
      </Container>
    </footer>
  );
}
