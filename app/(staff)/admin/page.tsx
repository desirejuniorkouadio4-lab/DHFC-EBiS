import { Gauge, Users, GraduationCap, Image, Settings, FileBarChart } from "lucide-react";
import { requireRole } from "@/lib/auth-helpers";
import { RoleSpace } from "@/components/staff/role-space";

export default async function AdminPage() {
  await requireRole(["ADMIN", "SUPERADMIN"]);
  return (
    <RoleSpace
      icon={Settings}
      title="Back-office administrateur"
      intro="Administrez la plateforme : utilisateurs, cohortes, médias et paramètres."
      features={[
        { icon: Gauge, title: "Indicateurs temps réel", desc: "Utilisateurs actifs, inscriptions, complétions, devoirs en attente." },
        { icon: Users, title: "Gestion des utilisateurs", desc: "Création, import CSV, rôles, désactivation, journal d'audit." },
        { icon: GraduationCap, title: "Gestion des cohortes", desc: "Création, affectation, duplication et clôture des cohortes." },
        { icon: Image, title: "Médiathèque", desc: "Bibliothèque centralisée et optimisation automatique des médias." },
        { icon: Settings, title: "Paramètres système", desc: "Branding, emails, notifications, intégrations, feature flags." },
        { icon: FileBarChart, title: "Rapports institutionnels", desc: "Rapports mensuels et trimestriels pour la DPFC, l'AFD, l'AUF." },
      ]}
    />
  );
}
