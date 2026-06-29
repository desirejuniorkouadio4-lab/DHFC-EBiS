"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

/** Copie un texte (URL de média) dans le presse-papiers. */
export function CopyButton({ value, label = "Copier l'URL" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value.startsWith("http") ? value : `${location.origin}${value}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // presse-papiers indisponible
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      title={label}
      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 text-xs font-semibold text-[var(--text-secondary)] transition-colors hover:border-orange-400 hover:text-orange-600"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copié" : "URL"}
    </button>
  );
}
