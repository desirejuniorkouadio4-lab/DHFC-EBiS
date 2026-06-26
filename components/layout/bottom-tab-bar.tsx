"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TabItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Variante mise en avant (bouton central). */
  highlight?: boolean;
};

/**
 * Barre d'onglets fixe en bas (pattern natif mobile). Visible uniquement < lg.
 * Le contenu de la page doit réserver l'espace via `.pb-bottom-nav`.
 */
export function BottomTabBar({ items }: { items: TabItem[] }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav
      aria-label="Navigation mobile"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
    >
      <div className="glass border-t border-[var(--border-subtle)] pb-safe">
        <ul
          className="grid"
          style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
        >
          {items.map((item) => {
            const active = isActive(item.href);

            if (item.highlight) {
              return (
                <li key={item.href} className="flex items-center justify-center">
                  <Link
                    href={item.href}
                    aria-label={item.label}
                    className="-mt-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-brand transition-transform active:scale-95"
                  >
                    <item.icon className="h-6 w-6" />
                  </Link>
                </li>
              );
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className="relative flex flex-col items-center gap-1 py-2.5"
                >
                  {active && (
                    <span className="absolute top-0 h-0.5 w-8 rounded-full bg-orange-500" />
                  )}
                  <item.icon
                    className={cn(
                      "h-[22px] w-[22px] transition-colors",
                      active ? "text-orange-500" : "text-neutral-400 dark:text-neutral-500"
                    )}
                  />
                  <span
                    className={cn(
                      "text-[11px] font-medium leading-none transition-colors",
                      active ? "text-orange-600 dark:text-orange-400" : "text-neutral-500 dark:text-neutral-400"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
