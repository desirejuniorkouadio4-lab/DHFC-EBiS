import { cn } from "@/lib/utils";

/**
 * Conteneur responsive : carrousel horizontal à défilement (snap) sur mobile,
 * grille classique sur desktop (≥ lg). Permet une disposition « app native »
 * sur mobile sans toucher au rendu desktop.
 *
 * Utiliser avec <RailItem> pour le dimensionnement des cartes.
 */
export function Rail({
  children,
  className,
  cols = "lg:grid-cols-3",
}: {
  children: React.ReactNode;
  className?: string;
  /** Classes de colonnes de la grille desktop (ex: "lg:grid-cols-2"). */
  cols?: string;
}) {
  return (
    <div
      className={cn(
        // Mobile : carrousel pleine largeur (bord à bord), snap
        "-mx-5 flex snap-x snap-mandatory touch-pan-x gap-4 overflow-x-auto scrollbar-none px-5 pb-2 sm:-mx-8 sm:px-8",
        // Desktop : grille
        "lg:mx-0 lg:grid lg:gap-6 lg:overflow-visible lg:px-0 lg:pb-0",
        cols,
        className
      )}
    >
      {children}
    </div>
  );
}

/** Élément d'un <Rail> : largeur « carte qui dépasse » sur mobile, auto sur desktop. */
export function RailItem({
  children,
  className,
  width = "w-[80%] sm:w-[58%]",
}: {
  children: React.ReactNode;
  className?: string;
  /** Largeur de la carte en mode carrousel (mobile). */
  width?: string;
}) {
  return (
    <div className={cn("snap-start shrink-0 lg:w-auto", width, className)}>{children}</div>
  );
}
