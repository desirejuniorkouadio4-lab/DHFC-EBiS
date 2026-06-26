# DHFC-EBiS — Vitrine institutionnelle

Vitrine institutionnelle de la plateforme **DHFC-EBiS** (Dispositif Hybride de
Formation Continue des Enseignants Bivalents de Sciences), porteur : DPFC / MENAET,
République de Côte d'Ivoire.

Cette application correspond à la **première brique** du cahier des charges
(`CAHIER_DES_CHARGES_DHFC-EBiS.md`) : la **vitrine publique** (Module 1, §9).
Le LMS, l'authentification réelle, la base de données et le back-office sont
décrits dans le cahier et feront l'objet des sprints suivants.

## Stack

| Élément | Choix |
|---|---|
| Framework | Next.js 15 (App Router, RSC) |
| Langage | TypeScript 5 (strict) |
| Styling | Tailwind CSS v4 (tokens CSS-first) |
| Animations | Framer Motion 12 |
| Icônes | lucide-react |
| Polices | Inter (corps) + Space Grotesk (display) via `next/font` |

> **Note typographie** : le cahier prévoit *Cabinet Grotesk* (police commerciale).
> En attendant l'acquisition de la licence, l'alternative libre **Space Grotesk**
> est utilisée (même famille de grotesque géométrique). Substituable via
> `app/layout.tsx`.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

### Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Lancer le build de production |
| `npm run typecheck` | Vérification TypeScript |

## Structure

```
app/
  (marketing)/        # Vitrine publique (header + footer partagés)
    page.tsx          # Accueil (hero, chiffres, mission, formats, témoignages…)
    mission/          # Mission, principes, gouvernance
    parcours/         # Catalogue filtrable + détail [slug]
    partenaires/      # Partenaires institutionnels & internationaux
    ressources/       # Bibliothèque publique
    actualites/       # Actualités
    contact/          # Formulaire de contact
    faq/              # Questions fréquentes
    mentions-legales/ confidentialite/ cgu/ accessibilite/   # Pages légales
  connexion/          # Écran de connexion (UI, sans backend)
  layout.tsx          # Layout racine (polices, métadonnées, thème)
  globals.css         # Design system (tokens, palette, mode sombre)
  icon.svg manifest.ts sitemap.ts robots.ts
components/
  brand/   layout/   marketing/   motion/   ui/   auth/   seo/
lib/
  data.ts             # Données de démonstration (mock)
  utils.ts            # Utilitaires (cn, formatage)
```

## Identité visuelle (charte)

- **Orange** `#F39200` · **Vert** `#009640` · **Noir** `#000000`
- Palette étendue, mode sombre et tokens dans `app/globals.css`.
- Logo recréé vectoriellement dans `components/brand/logo.tsx`
  (emblème « rassemblement des sciences » : ordinateur + ADN + verrerie).

## Conformité au cahier des charges

- ✅ Vitrine multi-pages (§9)
- ✅ Charte graphique, palette, mode sombre (§4)
- ✅ Animations & micro-interactions, `prefers-reduced-motion` (§23)
- ✅ Bases d'accessibilité : skip-link, focus visible, ARIA, contrastes (§24)
- ✅ SEO : métadonnées, JSON-LD, sitemap, robots (§26)
- ✅ En-têtes de sécurité (§25.2)
- 🔜 LMS, auth réelle, base de données, back-office (sprints suivants)

## Données

Les contenus (parcours, partenaires, témoignages, actualités) sont des **données
de démonstration** définies dans `lib/data.ts`. Dans la version cible, elles
proviendront de PostgreSQL via Prisma (cf. cahier §8).
