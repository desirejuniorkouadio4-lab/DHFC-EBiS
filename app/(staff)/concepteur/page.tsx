import { PencilRuler, Layers, ListChecks, Database, Image, Send } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { RoleSpace } from "@/components/staff/role-space";

export default async function ConcepteurPage() {
  await requireRole(["CONCEPTEUR", "ADMIN", "SUPERADMIN"]);
  return (
    <RoleSpace
      icon={PencilRuler}
      title="Espace concepteur"
      intro="Créez et publiez les contenus pédagogiques : parcours, leçons et exercices."
      features={[
        { icon: Layers, title: "Builder de parcours", desc: "Modules, leçons et blocs de contenu en glisser-déposer." },
        { icon: ListChecks, title: "Moteur d'exercices", desc: "13 types d'exercices, auto-correction et feedback configurables." },
        { icon: Database, title: "Banque de questions", desc: "Réutilisation d'exercices, tags, difficulté, import/export QTI." },
        { icon: Image, title: "Médiathèque", desc: "Bibliothèque centralisée d'images, vidéos, PDF et audios." },
        { icon: Send, title: "Publication", desc: "Brouillon, revue, publication et versionning des parcours." },
      ]}
    />
  );
}
