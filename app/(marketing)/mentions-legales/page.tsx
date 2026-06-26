import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose, Bullet } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales de la plateforme DHFC-EBiS.",
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title="Mentions légales"
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]}
      />
      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>Éditeur du site</h2>
            <p>
              La plateforme <strong>DHFC-EBiS</strong> (Dispositif Hybride de
              Formation Continue des Enseignants Bivalents de Sciences) est éditée
              par la <strong>Direction de la Pédagogie et de la Formation Continue
              (DPFC)</strong>, sous tutelle du Ministère de l'Éducation Nationale,
              de l'Alphabétisation et de l'Enseignement Technique (MENAET) de la
              République de Côte d'Ivoire.
            </p>
            <ul>
              <Bullet>Siège : DPFC, Plateau — Abidjan, Côte d'Ivoire</Bullet>
              <Bullet>Courriel : support@dhfc.dpfc.ci</Bullet>
              <Bullet>Directeur de la publication : le Directeur de la DPFC</Bullet>
            </ul>

            <h2>Hébergement</h2>
            <p>
              Le site est hébergé sur une infrastructure cloud sécurisée. Les
              coordonnées complètes de l'hébergeur sont disponibles sur demande
              auprès de la DTSI.
            </p>

            <h2>Propriété intellectuelle</h2>
            <p>
              L'ensemble des contenus (textes, vidéos, exercices, éléments
              graphiques, logos) présents sur la plateforme est protégé par le
              droit de la propriété intellectuelle. Toute reproduction non
              autorisée est interdite.
            </p>

            <h2>Responsabilité</h2>
            <p>
              La DPFC s'efforce d'assurer l'exactitude des informations diffusées
              sur le site, sans pouvoir en garantir l'exhaustivité. Les liens vers
              des sites tiers n'engagent pas la responsabilité de l'éditeur.
            </p>

            <h2>Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales, vous
              pouvez écrire à <a href="mailto:support@dhfc.dpfc.ci">support@dhfc.dpfc.ci</a>.
            </p>

            <p className="text-sm">Dernière mise à jour : juin 2026.</p>
          </Prose>
        </div>
      </Container>
    </>
  );
}
