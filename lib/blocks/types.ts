/** Contenu de leçon en blocs (§17.2) — éditeur de contenu riche. */

export type Block =
  | { id: string; type: "texte"; markdown: string }
  | { id: string; type: "image"; url: string; alt: string; caption: string }
  | { id: string; type: "callout"; variant: "info" | "conseil" | "attention"; markdown: string }
  | { id: string; type: "code"; language: string; code: string }
  | { id: string; type: "math"; latex: string }
  | { id: string; type: "embed"; url: string; title: string }
  | { id: string; type: "accordion"; title: string; markdown: string };

export type BlockType = Block["type"];
export type BlocksContent = { kind: "blocks"; blocks: Block[] };

export const BLOCK_TYPES: { type: BlockType; label: string; icon: string }[] = [
  { type: "texte", label: "Texte", icon: "AlignLeft" },
  { type: "image", label: "Image", icon: "Image" },
  { type: "callout", label: "Encadré", icon: "Info" },
  { type: "code", label: "Code", icon: "Code" },
  { type: "math", label: "Équation", icon: "Sigma" },
  { type: "embed", label: "Embed", icon: "Youtube" },
  { type: "accordion", label: "Accordéon", icon: "ChevronDown" },
];

let counter = 0;
export function blockUid(): string {
  counter += 1;
  return `b${Date.now().toString(36)}${counter.toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

export function createBlock(type: BlockType): Block {
  const id = blockUid();
  switch (type) {
    case "texte":
      return { id, type, markdown: "" };
    case "image":
      return { id, type, url: "", alt: "", caption: "" };
    case "callout":
      return { id, type, variant: "info", markdown: "" };
    case "code":
      return { id, type, language: "text", code: "" };
    case "math":
      return { id, type, latex: "" };
    case "embed":
      return { id, type, url: "", title: "" };
    case "accordion":
      return { id, type, title: "", markdown: "" };
  }
}

/**
 * Normalise le contenu d'une leçon « lecture » vers des blocs.
 * - Nouveau format ({ kind:"blocks" }) : tel quel.
 * - Ancien format ({ kind:"texte", sections }) : converti en blocs texte.
 */
export function normalizeBlocks(content: unknown): BlocksContent {
  const c = (content && typeof content === "object" ? content : {}) as Record<string, unknown>;
  if (Array.isArray(c.blocks)) {
    return { kind: "blocks", blocks: c.blocks as Block[] };
  }
  if (Array.isArray(c.sections)) {
    const blocks: Block[] = (c.sections as { heading?: string; body?: string[] }[]).map((s) => {
      const heading = s.heading ? `## ${s.heading}\n\n` : "";
      const body = (s.body ?? []).join("\n\n");
      return { id: blockUid(), type: "texte", markdown: heading + body };
    });
    return { kind: "blocks", blocks };
  }
  return { kind: "blocks", blocks: [] };
}

/** Transforme une URL (YouTube, Vimeo, GeoGebra…) en source d'iframe intégrable. */
export function embedSrc(url: string): string {
  const u = url.trim();
  const yt = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  const geo = u.match(/geogebra\.org\/(?:m|material\/iframe\/id)\/([\w-]+)/);
  if (geo) return `https://www.geogebra.org/material/iframe/id/${geo[1]}`;
  return u;
}
