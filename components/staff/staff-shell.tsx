"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { signOut } from "next-auth/react";
import {
  ExternalLink,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronRight,
} from "lucide-react";
import { Logo, LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { roleLabel } from "@/lib/rbac";
import { staffNav, type NavItem } from "@/components/staff/staff-nav";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "dhfc-staff-sidebar-collapsed";

/** Coque commune des espaces personnel (tuteur, encadreur, concepteur, admin). */
export function StaffShell({
  role,
  name,
  initials,
  children,
}: {
  role: string;
  name: string;
  initials: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const nav = staffNav(role);
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCollapsed(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);
  useEffect(() => setDrawerOpen(false), [pathname]);

  function toggleCollapsed() {
    setCollapsed((c) => {
      const next = !c;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  const railWidth = collapsed ? "lg:w-20" : "lg:w-64";
  const railPad = collapsed ? "lg:pl-20" : "lg:pl-64";

  return (
    <div className="min-h-screen bg-[var(--bg-secondary)]">
      {/* Sidebar desktop */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-primary)] transition-all duration-200 lg:flex",
          mounted ? railWidth : "lg:w-64"
        )}
      >
        <SidebarContent
          nav={nav}
          role={role}
          pathname={pathname}
          collapsed={mounted && collapsed}
          onToggle={toggleCollapsed}
        />
      </aside>

      {/* Drawer mobile */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden">
            <button aria-label="Fermer le menu" className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "tween", duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-[var(--border-subtle)] bg-[var(--bg-primary)]"
            >
              <SidebarContent nav={nav} role={role} pathname={pathname} collapsed={false} onClose={() => setDrawerOpen(false)} />
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <div className={cn("transition-all duration-200", mounted ? railPad : "lg:pl-64")}>
        {/* Topbar */}
        <header className="sticky top-0 z-30 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/85 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                aria-label="Ouvrir le menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)] lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </button>
              <span className="hidden rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 sm:inline-block dark:bg-orange-500/10 dark:text-orange-300">
                Espace {roleLabel(role).toLowerCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="hidden h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-orange-600 sm:inline-flex"
              >
                <ExternalLink className="h-4 w-4" /> Site
              </Link>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/connexion" })}
                className="inline-flex h-10 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-4 text-sm font-medium transition-colors hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-sm font-bold text-white" title={name}>
                {initials}
              </span>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent({
  nav,
  role,
  pathname,
  collapsed,
  onToggle,
  onClose,
}: {
  nav: { main: NavItem[]; secondary: NavItem[] };
  role: string;
  pathname: string;
  collapsed: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}) {
  return (
    <>
      <div className={cn("flex h-16 items-center border-b border-[var(--border-subtle)]", collapsed ? "justify-center px-2" : "justify-between px-4")}>
        <Link href="/" aria-label="Accueil DHFC-EBiS" className="min-w-0">
          {collapsed ? <LogoMark className="h-9 w-auto" /> : <Logo markClassName="h-9 w-auto" />}
        </Link>
        {onClose && (
          <button onClick={onClose} aria-label="Fermer" className="lg:hidden">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {nav.main.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
        ))}

        {nav.secondary.length > 0 && (
          <>
            <div className={cn("pt-3", collapsed ? "px-0" : "px-3")}>
              <span className={cn("text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)]", collapsed && "sr-only")}>Échanges</span>
              {collapsed && <div className="mx-auto my-2 h-px w-6 bg-[var(--border-subtle)]" />}
            </div>
            {nav.secondary.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} collapsed={collapsed} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-[var(--border-subtle)] p-3">
        <span className={cn("mb-2 block text-xs text-[var(--text-secondary)]", collapsed ? "text-center" : "px-2")}>
          {collapsed ? roleLabel(role).slice(0, 1) : `Espace ${roleLabel(role).toLowerCase()}`}
        </span>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            aria-label={collapsed ? "Déplier la barre latérale" : "Replier la barre latérale"}
            className={cn(
              "hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] lg:flex",
              collapsed && "justify-center px-0"
            )}
          >
            {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            {!collapsed && "Replier"}
          </button>
        )}
      </div>
    </>
  );
}

function NavLink({ item, pathname, collapsed }: { item: NavItem; pathname: string; collapsed: boolean }) {
  const active = pathname === item.href || pathname.startsWith(item.href + "/");
  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]"
      )}
    >
      <item.icon className={cn("h-5 w-5 shrink-0", active && "text-orange-500")} />
      {!collapsed && <span className="min-w-0 flex-1 truncate">{item.label}</span>}
      {!collapsed && active && <ChevronRight className="h-4 w-4 shrink-0" />}
    </Link>
  );
}
