import { Map, BarChart3, Users, FileSpreadsheet } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { RoleSpace } from "@/components/staff/role-space";

export default async function EncadreurPage() {
  await requireRole(["ENCADREUR"]);
  return (
    <RoleSpace
      icon={Map}
      title="Espace encadreur"
      intro="Pilotez la formation à l'échelle de votre DREN : vue agrégée et reporting."
      features={[
        { icon: BarChart3, title: "Tableau de bord régional", desc: "Vue d'ensemble de toutes les cohortes de votre DREN." },
        { icon: Users, title: "Comparaison entre tuteurs", desc: "Réactivité, taux de complétion, alertes par tuteur." },
        { icon: FileSpreadsheet, title: "Rapports", desc: "Exports PDF et Excel pour la DPFC et les partenaires." },
      ]}
    />
  );
}
