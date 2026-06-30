"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export type VitrineSection = { key: string; label: string; count: number; content: React.ReactNode };

export function VitrineTabs({ sections }: { sections: VitrineSection[] }) {
  const [active, setActive] = useState(sections[0]?.key ?? "");
  const current = sections.find((s) => s.key === active) ?? sections[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1.5">
        {sections.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === s.key ? "bg-orange-500 text-white" : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {s.label}
            <span className={cn("rounded-full px-1.5 text-xs", active === s.key ? "bg-white/20" : "bg-[var(--bg-primary)]")}>{s.count}</span>
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
