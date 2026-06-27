import {
  Sparkles,
  Flame,
  Target,
  Users,
  Award,
  BookOpenCheck,
  Trophy,
  type LucideIcon,
} from "lucide-react";

/** Résout une clé d'icône (stockée en base) vers un composant Lucide. */
const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Target,
  Users,
  Award,
  BookOpenCheck,
  Trophy,
};

export function badgeIcon(name: string): LucideIcon {
  return ICONS[name] ?? Trophy;
}
