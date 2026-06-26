import type { MetadataRoute } from "next";
import { PARCOURS, ACTUALITES } from "@/lib/data";

const BASE = "https://dhfc.dpfc.ci";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    "",
    "/mission",
    "/parcours",
    "/partenaires",
    "/ressources",
    "/actualites",
    "/contact",
    "/faq",
    "/mentions-legales",
    "/confidentialite",
    "/cgu",
    "/accessibilite",
  ].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));

  const parcoursRoutes = PARCOURS.map((p) => ({
    url: `${BASE}/parcours/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const actualiteRoutes = ACTUALITES.map((a) => ({
    url: `${BASE}/actualites/${a.slug}`,
    lastModified: new Date(a.date),
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...parcoursRoutes, ...actualiteRoutes];
}
