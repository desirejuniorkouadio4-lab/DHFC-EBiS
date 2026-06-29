"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  GraduationCap,
  Award,
  MessagesSquare,
  Mail,
  ExternalLink,
  Menu,
  X,
  Flame,
  Bell,
  ChevronRight,
  User,
  LogOut,
  Trophy,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { BottomTabBar, type TabItem } from "@/components/layout/bottom-tab-bar";
import type { SessionUser } from "@/lib/auth-helpers";
import { cn } from "@/lib/utils";

const MOBILE_TABS: TabItem[] = [
  { href: "/tableau-de-bord", label: "Accueil", icon: LayoutDashboard },
  { href: "/mes-parcours", label: "Parcours", icon: GraduationCap },
  { href: "/certificats", label: "Certificats", icon: Award },
  { href: "/profil", label: "Profil", icon: User },
];

const NAV = [
  { href: "/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/mes-parcours", label: "Mes parcours", icon: GraduationCap },
  { href: "/certificats", label: "Certificats", icon: Award },
  { href: "/classement", label: "Classement", icon: Trophy },
  { href: "/forums", label: "Forums", icon: MessagesSquare },
  { href: "/messagerie", label: "Messagerie", icon: Mail },
];

const NOTIFICATIONS = [
  { title: "Votre devoir a été corrigé", detail: "Analyse d'une expérience · 16/20", time: "Il y a 1 h" },
  { title: "Nouveau message", detail: "Fatou Diabaté (tutrice)", time: "Il y a 3 h" },
  { title: "Échéance approchante", detail: "Devoir à rendre dans 3 jours", time: "Hier" },
];

export function AppShell({ user, children }: { user: SessionUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] lg:flex">
        <SidebarContent pathname={pathname} user={user} />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <button
              aria-label="Fermer le menu"
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-primary)]"
            >
              <SidebarContent pathname={pathname} user={user} onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone principale */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Ouvrir le menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden sm:block">
              <p className="text-xs text-[var(--text-secondary)]">Bonjour,</p>
              <p className="text-sm font-semibold leading-tight">
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 sm:inline-flex dark:bg-orange-500/10 dark:text-orange-300">
              <Flame className="h-4 w-4" />
              {user.streak} jours
            </span>
            <NotificationsButton />
            <ThemeToggle />
            <Link
              href="/profil"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white"
              aria-label="Mon profil"
            >
              {user.initials}
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 pb-bottom-nav sm:px-6 lg:py-10 lg:pb-10">
          {children}
        </main>
      </div>

      {/* Barre d'onglets mobile */}
      <BottomTabBar items={MOBILE_TABS} />
    </div>
  );
}

function SidebarContent({
  pathname,
  user,
  onClose,
}: {
  pathname: string;
  user: SessionUser;
  onClose?: () => void;
}) {
  return (
    <>
      <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-5">
        <Link href="/tableau-de-bord" aria-label="Espace apprenant DHFC-EBiS">
          <Logo markClassName="h-10 w-auto" />
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Fermer" className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              <item.icon className={cn("h-5 w-5", active && "text-orange-500")} />
              {item.label}
              {active && <ChevronRight className="ml-auto h-4 w-4" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
        >
          <ExternalLink className="h-5 w-5" />
          Retour au site
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/connexion" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        >
          <LogOut className="h-5 w-5" />
          Se déconnecter
        </button>
        <Link
          href="/profil"
          className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--bg-secondary)]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
            {user.initials}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {user.firstName} {user.lastName}
            </span>
            <span className="block truncate text-xs text-[var(--text-secondary)]">
              {user.bivalence ?? user.role}
            </span>
          </span>
        </Link>
      </div>
    </>
  );
}

function NotificationsButton() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:text-orange-500"
      >
        <Bell className="h-[18px] w-[18px]" />
        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-500 ring-2 ring-[var(--bg-primary)]" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button className="fixed inset-0 z-40 cursor-default" aria-hidden onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-xl"
            >
              <div className="border-b border-[var(--border-subtle)] px-4 py-3">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <ul className="max-h-80 divide-y divide-[var(--border-subtle)] overflow-y-auto">
                {NOTIFICATIONS.map((n, i) => (
                  <li key={i} className="px-4 py-3 transition-colors hover:bg-[var(--bg-secondary)]">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{n.detail}</p>
                    <p className="mt-1 text-[11px] text-[var(--text-secondary)]">{n.time}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
