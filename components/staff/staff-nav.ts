import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Image as ImageIcon,
  BarChart3,
  Settings,
  PencilRuler,
  Library,
  ClipboardCheck,
  MessagesSquare,
  Mail,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

/**
 * Raccourcis de navigation de la sidebar staff, selon le rôle.
 * `main` = espace métier ; `secondary` = transverses (forums, messagerie).
 */
export function staffNav(role: string): { main: NavItem[]; secondary: NavItem[] } {
  const secondary: NavItem[] = [
    { href: "/forums", label: "Forums", icon: MessagesSquare },
    { href: "/messagerie", label: "Messagerie", icon: Mail },
  ];

  if (role === "ADMIN" || role === "SUPERADMIN") {
    return {
      main: [
        { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users },
        { href: "/admin/cohortes", label: "Cohortes", icon: GraduationCap },
        { href: "/admin/media", label: "Médiathèque", icon: ImageIcon },
        { href: "/concepteur", label: "Contenus", icon: PencilRuler },
        { href: "/admin/analytics", label: "Analytique", icon: BarChart3 },
        { href: "/admin/parametres", label: "Paramètres", icon: Settings },
      ],
      secondary,
    };
  }

  if (role === "CONCEPTEUR") {
    return {
      main: [
        { href: "/concepteur", label: "Mes parcours", icon: PencilRuler },
        { href: "/concepteur/banque", label: "Banque de questions", icon: Library },
      ],
      secondary,
    };
  }

  if (role === "TUTEUR") {
    return {
      main: [
        { href: "/tuteur", label: "Tableau de bord", icon: LayoutDashboard },
        { href: "/tuteur/corrections", label: "Corrections", icon: ClipboardCheck },
      ],
      secondary,
    };
  }

  if (role === "ENCADREUR") {
    return {
      main: [{ href: "/encadreur", label: "Supervision", icon: LayoutDashboard }],
      secondary,
    };
  }

  return { main: [], secondary };
}
