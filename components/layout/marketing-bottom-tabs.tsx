"use client";

import { Home, GraduationCap, Library, LogIn } from "lucide-react";
import { BottomTabBar, type TabItem } from "./bottom-tab-bar";

const MOBILE_TABS: TabItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/parcours", label: "Parcours", icon: GraduationCap },
  { href: "/ressources", label: "Ressources", icon: Library },
  { href: "/connexion", label: "Connexion", icon: LogIn },
];

/** Barre d'onglets mobile de la vitrine (les icônes restent côté client). */
export function MarketingBottomTabs() {
  return <BottomTabBar items={MOBILE_TABS} />;
}
