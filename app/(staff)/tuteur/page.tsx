import { Users, Bell, FileCheck, MessageSquare, Radio, Activity } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { RoleSpace } from "@/components/staff/role-space";

export default async function TuteurPage() {
  await requireRole(["TUTEUR"]);
  return (
    <RoleSpace
      icon={Users}
      title="Espace tuteur"
      intro="Accompagnez vos cohortes : suivi des apprenants, correction et communication."
      features={[
        { icon: Users, title: "Vue cohorte", desc: "Avancement par apprenant, quiz moyen, devoirs rendus, dernière connexion." },
        { icon: Bell, title: "Alertes", desc: "Apprenants inactifs depuis plus de 7 jours, en difficulté, ou en tête de cohorte." },
        { icon: FileCheck, title: "Correction des devoirs", desc: "Annotations inline, rubrique de notation, feedback écrit et audio." },
        { icon: MessageSquare, title: "Messagerie & annonces", desc: "Échanges 1-à-1, annonces de cohorte, forums disciplinaires." },
        { icon: Radio, title: "Sessions live", desc: "Planification de visioconférences avec rappels automatiques." },
        { icon: Activity, title: "Statistiques de réactivité", desc: "Temps de réponse, taux de complétion de votre cohorte." },
      ]}
    />
  );
}
