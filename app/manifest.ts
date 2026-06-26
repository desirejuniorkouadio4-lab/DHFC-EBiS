import type { MetadataRoute } from "next";

/** Manifest PWA — DHFC-EBiS (cahier §19.1 / §31.11). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DHFC-EBiS — Formation continue des enseignants de sciences",
    short_name: "DHFC-EBiS",
    description:
      "Dispositif Hybride de Formation Continue des Enseignants Bivalents de Sciences — Côte d'Ivoire.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#f39200",
    lang: "fr",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
