import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import "highlight.js/styles/atom-one-dark.css";
import { AnnouncementBanner } from "@/components/layout/announcement-banner";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

// Space Grotesk : alternative libre à « Cabinet Grotesk » (police commerciale),
// même famille de grotesque géométrique. Substituable par les fichiers
// Cabinet Grotesk une fois la licence acquise (cf. cahier §4.4).
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "600", "700"],
});

const SITE_URL = "https://dhfc.dpfc.ci";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "DHFC-EBiS — Dispositif Hybride de Formation Continue des Enseignants de Sciences",
    template: "%s · DHFC-EBiS",
  },
  description:
    "Plateforme nationale de formation continue des enseignants bivalents de sciences de Côte d'Ivoire. Parcours hybrides, en ligne, hors-ligne et imprimables, portés par la DPFC.",
  keywords: [
    "DHFC-EBiS",
    "formation continue",
    "enseignants",
    "sciences",
    "Côte d'Ivoire",
    "DPFC",
    "MENAET",
    "bivalence",
    "LMS",
  ],
  authors: [{ name: "DPFC — MENAET" }],
  openGraph: {
    type: "website",
    locale: "fr_CI",
    url: SITE_URL,
    siteName: "DHFC-EBiS",
    title: "DHFC-EBiS — Former la prochaine génération d'enseignants de sciences",
    description:
      "Le dispositif hybride national de formation continue des enseignants bivalents de sciences en Côte d'Ivoire.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DHFC-EBiS",
    description:
      "Plateforme nationale de formation continue des enseignants de sciences — Côte d'Ivoire.",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#f39200",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

// Évite le flash de thème (FOUC) en appliquant data-theme avant le premier paint.
const themeScript = `
(function () {
  try {
    var stored = localStorage.getItem('dhfc-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a
          href="#contenu-principal"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-orange-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu principal
        </a>
        <AnnouncementBanner />
        {children}
      </body>
    </html>
  );
}
