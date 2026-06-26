import type { Metadata } from "next";
import { Container } from "@/components/ui/container";
import { PageHero } from "@/components/marketing/page-hero";
import { Prose, Bullet } from "@/components/ui/prose";

export const metadata: Metadata = {
  title: "Conditions générales d'utilisation",
  description: "Conditions générales d'utilisation de la plateforme DHFC-EBiS.",
};

export default function CguPage() {
  return (
    <>
      <PageHero
        eyebrow="Légal"
        title="Conditions générales d'utilisation"
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "CGU" }]}
      />
      <Container className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl">
          <Prose>
            <h2>1. Objet</h2>
            <p>
              Les présentes conditions générales d'utilisation (CGU) régissent
              l'accès et l'usage de la plateforme DHFC-EBiS par les utilisateurs
              autorisés (apprenants, tuteurs, encadreurs, concepteurs,
              administrateurs).
            </p>

            <h2>2. Accès à la plateforme</h2>
            <p>
              L'accès est réservé aux personnes désignées dans le cadre des
              cohortes de formation continue. L'inscription se fait par invitation
              de l'administrateur. Chaque utilisateur est responsable de la
              confidentialité de ses identifiants.
            </p>

            <h2>3. Usage attendu</h2>
            <ul>
              <Bullet>Utiliser la plateforme à des fins de formation professionnelle uniquement.</Bullet>
              <Bullet>Respecter les autres utilisateurs dans les forums et la messagerie.</Bullet>
              <Bullet>Ne pas partager de contenu illicite, diffamatoire ou contraire aux bonnes mœurs.</Bullet>
              <Bullet>Ne pas tenter de contourner les mesures de sécurité de la plateforme.</Bullet>
            </ul>

            <h2>4. Contenus pédagogiques</h2>
            <p>
              Les contenus mis à disposition restent la propriété de la DPFC et de
              ses concepteurs. Ils sont destinés à un usage personnel dans le cadre
              de la formation et ne peuvent être redistribués sans autorisation.
            </p>

            <h2>5. Modération</h2>
            <p>
              La DPFC se réserve le droit de modérer les contenus publiés et de
              suspendre tout compte ne respectant pas les présentes conditions.
            </p>

            <h2>6. Évolution des CGU</h2>
            <p>
              Les présentes CGU peuvent être mises à jour. Les utilisateurs seront
              informés de toute modification substantielle.
            </p>

            <p className="text-sm">Dernière mise à jour : juin 2026.</p>
          </Prose>
        </div>
      </Container>
    </>
  );
}
