"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, PlayCircle, Sparkles, MousePointer2, LayoutDashboard } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";
import { DISCIPLINES } from "@/lib/data";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero({ homeHref }: { homeHref?: string }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: reduce ? 0 : 22 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  };

  return (
    <section className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pt-44">
      {/* Fonds décoratifs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        {/* Photo de fond — enseignant en formation */}
        <Image
          src="/image_hero.png"
          alt=""
          aria-hidden
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_28%]"
        />
        {/* Voile adaptatif (clair/sombre) pour la lisibilité du texte */}
        <div className="absolute inset-0 bg-[var(--bg-primary)]/45" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)] via-[var(--bg-primary)]/88 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/55 via-transparent to-[var(--bg-primary)]/55" />
        {/* Grille + halos colorés */}
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-orange-400/20 blur-3xl" />
        <div className="absolute -right-16 top-32 h-80 w-80 rounded-full bg-green-400/15 blur-3xl" />
      </div>

      {/* Formes flottantes */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 -z-10 hidden lg:block" aria-hidden>
          {[
            { c: "bg-orange-500", x: "12%", y: "22%", s: 14, d: 0 },
            { c: "bg-green-500", x: "84%", y: "30%", s: 18, d: 1.2 },
            { c: "bg-orange-400", x: "78%", y: "70%", s: 10, d: 0.6 },
            { c: "bg-green-400", x: "18%", y: "74%", s: 12, d: 1.8 },
          ].map((p, i) => (
            <motion.span
              key={i}
              className={`absolute rounded-full ${p.c}`}
              style={{ left: p.x, top: p.y, width: p.s, height: p.s }}
              animate={{ y: [0, -18, 0], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut", delay: p.d }}
            />
          ))}
        </div>
      )}

      <Container>
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="mx-auto flex max-w-4xl flex-col items-center text-center"
        >
          <motion.div variants={item}>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-xs font-semibold text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-300">
              <Sparkles className="h-3.5 w-3.5" />
              Plateforme nationale de formation continue · Côte d'Ivoire
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            Former la prochaine génération
            <br className="hidden sm:block" />{" "}
            <span className="text-gradient-brand">d'enseignants de sciences</span>
            <br className="hidden sm:block" /> en Côte d'Ivoire
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 max-w-2xl text-balance text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg"
          >
            Un dispositif hybride qui forme les enseignants bivalents de sciences
            partout sur le territoire — en ligne, hors-ligne et sur le terrain.
            Pensé pour les réalités de la Côte d'Ivoire.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Button href="/parcours" size="lg">
              Découvrir les parcours
              <ArrowRight className="h-5 w-5 transition-transform group-hover/btn:translate-x-1" />
            </Button>
            {homeHref ? (
              <Button href={homeHref} variant="outline" size="lg">
                <LayoutDashboard className="h-5 w-5" />
                Mon espace
              </Button>
            ) : (
              <Button href="/connexion" variant="outline" size="lg">
                <PlayCircle className="h-5 w-5" />
                Se connecter
              </Button>
            )}
          </motion.div>

          {/* Disciplines */}
          <motion.div variants={item} className="mt-12 w-full">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-secondary)]">
              4 disciplines · 2 bivalences scientifiques
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
              {DISCIPLINES.map((d) => (
                <span
                  key={d.slug}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--bg-elevated)] px-4 py-2 text-sm font-medium shadow-sm"
                >
                  <d.icon className="h-4 w-4" style={{ color: d.color }} />
                  {d.name}
                </span>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Emblème flottant */}
        {!reduce && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8, ease: EASE }}
            className="pointer-events-none absolute right-[6%] top-28 hidden xl:block"
            aria-hidden
          >
            <motion.div
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]/80 p-5 shadow-2xl backdrop-blur"
            >
              <LogoMark className="h-16 w-auto" />
            </motion.div>
          </motion.div>
        )}
      </Container>

      {/* Indicateur de scroll */}
      {!reduce && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[var(--text-secondary)] sm:flex"
        >
          <MousePointer2 className="h-4 w-4" />
          <span className="text-[11px] font-medium uppercase tracking-wider">Défiler</span>
          <motion.span
            className="h-8 w-px bg-gradient-to-b from-orange-500 to-transparent"
            animate={{ scaleY: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            style={{ transformOrigin: "top" }}
          />
        </motion.div>
      )}
    </section>
  );
}
