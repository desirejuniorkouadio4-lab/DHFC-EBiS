import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoMarkProps = {
  className?: string;
  /** Conservé pour compatibilité d'API (n'altère pas le PNG officiel). */
  variant?: "color" | "white";
  title?: string;
  priority?: boolean;
};

/**
 * Emblème officiel DHFC-EBiS (cf. charte §4.6) — image fournie `public/logo-mark.png`.
 * Le conteneur définit la taille (via `className`), l'image est contenue dedans.
 */
export function LogoMark({ className, title = "DHFC-EBiS", priority = false }: LogoMarkProps) {
  return (
    <Image
      src="/logo-mark.png"
      alt={title}
      width={703}
      height={624}
      priority={priority}
      className={cn("w-auto object-contain", className)}
    />
  );
}

type LogoProps = {
  className?: string;
  variant?: "color" | "white";
  /** Affiche le mot-symbole « DHFC-EBiS » à côté de l'emblème. */
  withWordmark?: boolean;
  markClassName?: string;
  priority?: boolean;
};

/** Logo horizontal : emblème officiel + mot-symbole, destiné au header / footer. */
export function Logo({
  className,
  variant = "color",
  withWordmark = true,
  markClassName,
  priority = false,
}: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark priority={priority} className={cn("h-12 w-auto", markClassName)} />
      {withWordmark && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-xl font-extrabold tracking-tight",
              variant === "white" ? "text-white" : "text-[var(--text-primary)]"
            )}
          >
            DHFC<span className="text-orange-500">-</span>EBiS
          </span>
          <span
            className={cn(
              "mt-1 text-[10px] font-medium uppercase tracking-[0.14em]",
              variant === "white" ? "text-white/60" : "text-[var(--text-secondary)]"
            )}
          >
            Formation continue
          </span>
        </span>
      )}
    </span>
  );
}
