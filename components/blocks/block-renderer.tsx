"use client";

import katex from "katex";
import { Info, Lightbulb, AlertTriangle } from "lucide-react";
import { Markdown } from "./markdown";
import { embedSrc, type Block } from "@/lib/blocks/types";
import { cn } from "@/lib/utils";

/** Rend une liste de blocs de contenu (player + prévisualisation concepteur). */
export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  if (blocks.length === 0) {
    return <p className="text-sm text-[var(--text-secondary)]">Cette leçon n'a pas encore de contenu.</p>;
  }
  return (
    <div className="space-y-5">
      {blocks.map((b) => (
        <BlockView key={b.id} block={b} />
      ))}
    </div>
  );
}

const CALLOUT = {
  info: { icon: Info, cls: "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-100" },
  conseil: { icon: Lightbulb, cls: "border-green-300 bg-green-50 text-green-900 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-100" },
  attention: { icon: AlertTriangle, cls: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-100" },
} as const;

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "texte":
      return <Markdown>{block.markdown}</Markdown>;

    case "image":
      if (!block.url) return null;
      return (
        <figure className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.url} alt={block.alt} className="w-full rounded-xl border border-[var(--border-subtle)]" />
          {block.caption && <figcaption className="text-center text-xs text-[var(--text-secondary)]">{block.caption}</figcaption>}
        </figure>
      );

    case "callout": {
      const meta = CALLOUT[block.variant] ?? CALLOUT.info;
      const Icon = meta.icon;
      return (
        <div className={cn("flex gap-3 rounded-2xl border p-4", meta.cls)}>
          <Icon className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="min-w-0 flex-1 [&_.prose-dhfc]:!text-current">
            <Markdown>{block.markdown}</Markdown>
          </div>
        </div>
      );
    }

    case "code":
      return <Markdown>{`\`\`\`${block.language || "text"}\n${block.code}\n\`\`\``}</Markdown>;

    case "math": {
      if (!block.latex.trim()) return null;
      const html = katex.renderToString(block.latex, { displayMode: true, throwOnError: false });
      return <div className="overflow-x-auto py-2 text-center" dangerouslySetInnerHTML={{ __html: html }} />;
    }

    case "embed": {
      if (!block.url) return null;
      return (
        <figure className="space-y-2">
          <div className="aspect-video overflow-hidden rounded-xl border border-[var(--border-subtle)]">
            <iframe
              src={embedSrc(block.url)}
              title={block.title || "Contenu intégré"}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="h-full w-full"
            />
          </div>
          {block.title && <figcaption className="text-center text-xs text-[var(--text-secondary)]">{block.title}</figcaption>}
        </figure>
      );
    }

    case "accordion":
      return (
        <details className="group rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-4">
          <summary className="cursor-pointer list-none font-semibold marker:content-none">
            <span className="inline-flex items-center gap-2">
              <span className="text-orange-500 transition-transform group-open:rotate-90">▶</span>
              {block.title || "Détails"}
            </span>
          </summary>
          <div className="mt-3">
            <Markdown>{block.markdown}</Markdown>
          </div>
        </details>
      );
  }
}
