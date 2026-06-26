import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose, Bullet } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  description:
    "Politique de confidentialité du DHFC-EBiS — Loi ivoirienne 2013-450 et RGPD.",
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title="Politique de confidentialité"
        description="Protection de vos données personnelles, conformément à la loi ivoirienne n°2013-450 et au RGPD."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Confidentialité" }]}
      />
      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>1. Responsable du traitement</h2>
            <p>
              Le responsable du traitement des données est la{" "}
              <strong>Direction de la Pédagogie et de la Formation Continue
              (DPFC)</strong>. Un Délégué à la Protection des Données (DPO) est
              désigné et joignable à l'adresse <a href="mailto:dpo@dhfc.dpfc.ci">dpo@dhfc.dpfc.ci</a>.
            </p>

            <h2>2. Données collectées</h2>
            <ul>
              <Bullet>Données d'identité : nom, prénom, matricule MENAET, e-mail, téléphone.</Bullet>
              <Bullet>Données professionnelles : discipline, bivalence, DREN, collège d'affectation.</Bullet>
              <Bullet>Données d'usage : progression, résultats aux exercices, temps de connexion.</Bullet>
            </ul>

            <h2>3. Finalités</h2>
            <p>Vos données sont traitées pour les finalités suivantes :</p>
            <ul>
              <Bullet>Gestion de votre compte et de votre parcours de formation.</Bullet>
              <Bullet>Suivi pédagogique et accompagnement par votre tuteur.</Bullet>
              <Bullet>Production de rapports d'impact anonymisés pour la DPFC et ses partenaires.</Bullet>
            </ul>

            <h2>4. Base légale</h2>
            <p>
              Le traitement repose sur l'exécution de la mission d'intérêt public
              de formation continue des enseignants et, le cas échéant, sur votre
              consentement (notifications, classement optionnel).
            </p>

            <h2>5. Durée de conservation</h2>
            <p>
              Les données sont conservées pendant la durée de votre participation
              au dispositif, puis archivées conformément aux obligations légales.
            </p>

            <h2>6. Vos droits</h2>
            <p>
              Conformément à la réglementation, vous disposez d'un droit d'accès,
              de rectification, d'effacement, de limitation et d'opposition. Pour
              les exercer, contactez le DPO. Vous pouvez également saisir l'ARTCI
              (Autorité de Régulation des Télécommunications de Côte d'Ivoire).
            </p>

            <h2>7. Cookies</h2>
            <p>
              Le site n'utilise que les cookies strictement nécessaires à son
              fonctionnement. Tout cookie de mesure d'audience est soumis à votre
              consentement préalable.
            </p>

            <p className="text-sm">Dernière mise à jour : juin 2026.</p>
          </Prose>
        </div>
      </Container>
    </>
  );
}
