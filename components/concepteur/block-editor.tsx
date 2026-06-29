"use client";

import { useState } from "react";
import {
  AlignLeft,
  Image as ImageIcon,
  Info,
  Code,
  Sigma,
  Youtube,
  ChevronDown,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Eye,
  Pencil,
} from "lucide-react";
import { BLOCK_TYPES, createBlock, type Block, type BlockType } from "@/lib/blocks/types";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { Uploader } from "@/components/upload/uploader";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof AlignLeft> = {
  AlignLeft,
  Image: ImageIcon,
  Info,
  Code,
  Sigma,
  Youtube,
  ChevronDown,
};

const input =
  "h-10 w-full rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] px-3 text-sm outline-none focus:border-orange-500";
const area =
  "w-full resize-y rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3 text-sm outline-none focus:border-orange-500";
const mdHint = "Markdown : **gras**, # titre, - liste, [lien](url), `code`, $maths$, tableaux.";

export function BlockEditor({
  value,
  onChange,
  blobEnabled,
}: {
  value: Block[];
  onChange: (b: Block[]) => void;
  blobEnabled: boolean;
}) {
  const [preview, setPreview] = useState(false);
  const [newType, setNewType] = useState<BlockType>("texte");

  const update = (b: Block) => onChange(value.map((x) => (x.id === b.id ? b : x)));
  const remove = (id: string) => onChange(value.filter((x) => x.id !== id));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--text-secondary)]">
          {value.length} bloc{value.length > 1 ? "s" : ""}
        </span>
        <button
          type="button"
          onClick={() => setPreview((p) => !p)}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-[var(--border-subtle)] px-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
        >
          {preview ? <><Pencil className="h-4 w-4" /> Éditer</> : <><Eye className="h-4 w-4" /> Aperçu</>}
        </button>
      </div>

      {preview ? (
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-5">
          <BlockRenderer blocks={value} />
        </div>
      ) : (
        <div className="space-y-3">
          {value.map((block, i) => (
            <article key={block.id} className="rounded-2xl border border-[var(--border-subtle)] p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300">
                  {i + 1}. {BLOCK_TYPES.find((t) => t.type === block.type)?.label}
                </span>
                <div className="flex items-center gap-1">
                  <IconBtn label="Monter" onClick={() => move(i, -1)} disabled={i === 0}>
                    <ArrowUp className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Descendre" onClick={() => move(i, 1)} disabled={i === value.length - 1}>
                    <ArrowDown className="h-4 w-4" />
                  </IconBtn>
                  <IconBtn label="Supprimer" danger onClick={() => remove(block.id)}>
                    <Trash2 className="h-4 w-4" />
                  </IconBtn>
                </div>
              </div>
              <BlockFields block={block} onUpdate={update} blobEnabled={blobEnabled} />
            </article>
          ))}

          {/* Ajouter un bloc */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-dashed border-[var(--border-subtle)] p-3">
            <select value={newType} onChange={(e) => setNewType(e.target.value as BlockType)} className={cn(input, "w-40")}>
              {BLOCK_TYPES.map((t) => (
                <option key={t.type} value={t.type}>
                  {t.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => onChange([...value, createBlock(newType)])}
              className="inline-flex h-10 items-center gap-2 rounded-full bg-orange-500 px-4 text-sm font-semibold text-white hover:bg-orange-600"
            >
              <Plus className="h-4 w-4" /> Ajouter un bloc
            </button>
            <span className="flex flex-wrap gap-1.5">
              {BLOCK_TYPES.map((t) => {
                const Icon = ICONS[t.icon] ?? AlignLeft;
                return (
                  <button
                    key={t.type}
                    type="button"
                    title={t.label}
                    onClick={() => onChange([...value, createBlock(t.type)])}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                );
              })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function IconBtn({ children, label, danger, disabled, onClick }: { children: React.ReactNode; label: string; danger?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] transition-colors disabled:opacity-30",
        danger ? "hover:border-red-300 hover:text-red-600" : "hover:border-orange-400 hover:text-orange-600"
      )}
    >
      {children}
    </button>
  );
}

function BlockFields({ block, onUpdate, blobEnabled }: { block: Block; onUpdate: (b: Block) => void; blobEnabled: boolean }) {
  switch (block.type) {
    case "texte":
      return (
        <div className="space-y-1.5">
          <textarea value={block.markdown} onChange={(e) => onUpdate({ ...block, markdown: e.target.value })} rows={5} placeholder="Rédigez en Markdown…" className={area} />
          <p className="text-xs text-[var(--text-secondary)]">{mdHint}</p>
        </div>
      );

    case "image":
      return (
        <div className="space-y-2">
          {block.url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={block.url} alt={block.alt} className="max-h-40 rounded-lg border border-[var(--border-subtle)]" />
          )}
          <Uploader
            blobEnabled={blobEnabled}
            prefix="lecons"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            maxMb={5}
            compact
            hint="Image — 5 Mo max."
            onUploaded={async (r) => onUpdate({ ...block, url: r.url })}
          />
          <input value={block.caption} onChange={(e) => onUpdate({ ...block, caption: e.target.value })} placeholder="Légende (optionnel)" className={input} />
        </div>
      );

    case "callout":
      return (
        <div className="space-y-2">
          <select value={block.variant} onChange={(e) => onUpdate({ ...block, variant: e.target.value as typeof block.variant })} className={cn(input, "w-44")}>
            <option value="info">Info</option>
            <option value="conseil">Conseil</option>
            <option value="attention">Attention</option>
          </select>
          <textarea value={block.markdown} onChange={(e) => onUpdate({ ...block, markdown: e.target.value })} rows={3} placeholder="Contenu de l'encadré (Markdown)" className={area} />
        </div>
      );

    case "code":
      return (
        <div className="space-y-2">
          <input value={block.language} onChange={(e) => onUpdate({ ...block, language: e.target.value })} placeholder="Langage (ex. python, js, text)" className={cn(input, "w-56")} />
          <textarea value={block.code} onChange={(e) => onUpdate({ ...block, code: e.target.value })} rows={5} spellCheck={false} placeholder="Votre code…" className={cn(area, "font-mono text-xs")} />
        </div>
      );

    case "math":
      return (
        <div className="space-y-2">
          <textarea value={block.latex} onChange={(e) => onUpdate({ ...block, latex: e.target.value })} rows={2} spellCheck={false} placeholder="Équation LaTeX, ex. \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}" className={cn(area, "font-mono text-xs")} />
          {block.latex.trim() && (
            <div className="rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-primary)] p-3">
              <BlockRenderer blocks={[block]} />
            </div>
          )}
        </div>
      );

    case "embed":
      return (
        <div className="space-y-2">
          <input value={block.url} onChange={(e) => onUpdate({ ...block, url: e.target.value })} placeholder="URL YouTube, Vimeo ou GeoGebra" className={input} />
          <input value={block.title} onChange={(e) => onUpdate({ ...block, title: e.target.value })} placeholder="Titre (optionnel)" className={input} />
        </div>
      );

    case "accordion":
      return (
        <div className="space-y-2">
          <input value={block.title} onChange={(e) => onUpdate({ ...block, title: e.target.value })} placeholder="Titre de l'accordéon" className={input} />
          <textarea value={block.markdown} onChange={(e) => onUpdate({ ...block, markdown: e.target.value })} rows={3} placeholder="Contenu (Markdown)" className={area} />
        </div>
      );
  }
}
