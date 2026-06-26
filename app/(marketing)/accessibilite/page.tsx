import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose, Bullet } from "@/components/ui/prose";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Déclaration d'accessibilité",
  description:
    "Déclaration d'accessibilité du DHFC-EBiS — conformité RGAA 4.1 et WCAG 2.2 niveau AA.",
};

export default function AccessibilitePage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title="Déclaration d'accessibilité"
        description="Le DHFC-EBiS s'engage à rendre sa plateforme accessible au plus grand nombre, conformément au RGAA 4.1 et aux WCAG 2.2 niveau AA."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Accessibilité" }]}
      />
      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Badge tone="green">État : partiellement conforme</Badge>
          </div>
          <Prose>
            <h2>Engagement</h2>
            <p>
              La DPFC s'engage à rendre la plateforme DHFC-EBiS accessible
              conformément à l'article pertinent de la réglementation ivoirienne,
              en s'appuyant sur le <strong>RGAA 4.1</strong> et les{" "}
              <strong>WCAG 2.2 niveau AA</strong>.
            </p>

            <h2>Mesures mises en œuvre</h2>
            <ul>
              <Bullet>Navigation complète au clavier et indicateurs de focus visibles.</Bullet>
              <Bullet>Contrastes de couleurs validés (ratio minimum 4,5:1 pour le texte).</Bullet>
              <Bullet>Liens d'évitement vers le contenu principal.</Bullet>
              <Bullet>Textes alternatifs sur les images porteuses d'information.</Bullet>
              <Bullet>Respect de la préférence « réduire les animations » du système.</Bullet>
              <Bullet>Structure sémantique (titres, repères ARIA, langue déclarée).</Bullet>
            </ul>

            <h2>État de conformité</h2>
            <p>
              La plateforme est en cours d'audit complet. Certaines fonctionnalités
              avancées (player vidéo, exercices interactifs) font l'objet d'une
              vérification renforcée. Les non-conformités identifiées sont traitées
              de manière prioritaire.
            </p>

            <h2>Signaler un problème</h2>
            <p>
              Si vous rencontrez un défaut d'accessibilité, contactez-nous à{" "}
              <a href="mailto:accessibilite@dhfc.dpfc.ci">accessibilite@dhfc.dpfc.ci</a>.
              Nous nous engageons à vous répondre et à proposer une alternative
              accessible.
            </p>

            <h2>Voies de recours</h2>
            <p>
              Si vous constatez un défaut d'accessibilité vous empêchant d'accéder
              à un contenu et que vous n'obtenez pas de réponse satisfaisante, vous
              pouvez saisir les autorités compétentes.
            </p>

            <p className="text-sm">Dernière mise à jour : juin 2026.</p>
          </Prose>
        </div>
      </Container>
    </>
  );
}
