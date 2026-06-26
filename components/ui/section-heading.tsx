import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { Reveal } from "@/components/motion/reveal";

type SectionHeadingProps = {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  tone?: "orange" | "green" | "neutral";
};

/** En-tête de section réutilisable (eyebrow + titre + description). */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
  tone = "orange",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start text-left",
        className
      )}
    >
      {eyebrow && (
        <Reveal>
          <Badge tone={tone}>{eyebrow}</Badge>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
          {title}
        </h2>
      </Reveal>
      {description && (
        <Reveal delay={0.1}>
          <p className="text-balance text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
            {description}
          </p>
        </Reveal>
      )}
    </div>
  );
}
