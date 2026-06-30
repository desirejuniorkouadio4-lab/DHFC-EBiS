"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, LogIn, ArrowRight, LayoutDashboard } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

type HeaderSession = { initials: string; avatarUrl: string | null; homeHref: string } | null;

/** Header sticky : transparent en haut de page, solide (glass) au scroll (§9.3). */
export function Header({ session }: { session?: HeaderSession }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-[var(--border-subtle)] py-2.5"
          : "border-b border-transparent py-4"
      )}
    >
      <Container className="flex items-center justify-between gap-4">
        <Link href="/" aria-label="Accueil DHFC-EBiS" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-orange-600"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                )}
              >
                {link.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-orange-500"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          {session ? (
            <>
              <Button href={session.homeHref} variant="ghost" size="sm" className="hidden md:inline-flex">
                <LayoutDashboard className="h-4 w-4" />
                Mon espace
              </Button>
              <Link
                href="/profil"
                aria-label="Mon profil"
                className="hidden h-9 shrink-0 sm:inline-flex"
                title="Mon profil"
              >
                {session.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={session.avatarUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-green-500 text-xs font-bold text-white">
                    {session.initials}
                  </span>
                )}
              </Link>
            </>
          ) : (
            <>
              <Button href="/connexion" variant="ghost" size="sm" className="hidden md:inline-flex">
                <LogIn className="h-4 w-4" />
                Se connecter
              </Button>
              <Button href="/parcours" size="sm" className="hidden sm:inline-flex">
                Découvrir
                <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
              </Button>
            </>
          )}

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 text-neutral-700 lg:hidden dark:border-neutral-700 dark:text-neutral-200"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>
    </header>

    {/* Menu mobile plein écran (app-style) — via portal pour échapper au
        bloc de confinement créé par le backdrop-filter du header au scroll. */}
    {mounted &&
      createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[70] flex flex-col bg-[var(--bg-primary)] lg:hidden"
              aria-label="Navigation mobile"
            >
            <div className="flex h-16 items-center justify-between border-b border-[var(--border-subtle)] px-5">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer le menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-subtle)]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-5 py-6">
              <ul className="flex flex-col gap-1">
                {NAV_LINKS.map((link, i) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={link.href}
                      className="flex items-center justify-between border-b border-[var(--border-subtle)] py-4 text-2xl font-bold tracking-tight transition-colors active:text-orange-600"
                    >
                      {link.label}
                      <ArrowRight className="h-5 w-5 text-neutral-300" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <div className="space-y-3 border-t border-[var(--border-subtle)] px-5 py-5 pb-safe">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[var(--text-secondary)]">Apparence</span>
                <ThemeToggle />
              </div>
              {session ? (
                <>
                  <Button href={session.homeHref} variant="outline" size="lg" className="w-full">
                    <LayoutDashboard className="h-5 w-5" /> Mon espace
                  </Button>
                  <Button href="/profil" size="lg" className="w-full">
                    Mon profil <ArrowRight className="h-5 w-5" />
                  </Button>
                </>
              ) : (
                <>
                  <Button href="/connexion" variant="outline" size="lg" className="w-full">
                    <LogIn className="h-5 w-5" /> Se connecter
                  </Button>
                  <Button href="/parcours" size="lg" className="w-full">
                    Découvrir les parcours <ArrowRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}
    </>
  );
}
