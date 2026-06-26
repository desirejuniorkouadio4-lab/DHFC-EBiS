/** Données structurées Schema.org pour le SEO (§9.4 / §26.3). */
export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "DHFC-EBiS",
    alternateName:
      "Dispositif Hybride de Formation Continue des Enseignants Bivalents de Sciences",
    description:
      "Plateforme nationale de formation continue des enseignants bivalents de sciences de Côte d'Ivoire.",
    url: "https://dhfc.dpfc.ci",
    foundingDate: "2026",
    areaServed: { "@type": "Country", name: "Côte d'Ivoire" },
    parentOrganization: {
      "@type": "GovernmentOrganization",
      name: "Direction de la Pédagogie et de la Formation Continue (DPFC)",
    },
    address: {
      "@type": "PostalAddress",
      addressLocality: "Abidjan",
      addressCountry: "CI",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
