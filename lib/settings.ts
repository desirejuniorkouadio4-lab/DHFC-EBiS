import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

/** Paramètres système (§17.6), mis en cache et invalidés via le tag "site-settings". */

export type SiteSettings = {
  announcementEnabled: boolean;
  announcementText: string;
  maintenanceEnabled: boolean;
  maintenanceText: string;
};

export const SETTINGS_DEFAULTS: SiteSettings = {
  announcementEnabled: false,
  announcementText: "",
  maintenanceEnabled: false,
  maintenanceText: "La plateforme est temporairement en maintenance. Merci de réessayer plus tard.",
};

export const getSiteSettings = unstable_cache(
  async (): Promise<SiteSettings> => {
    const rows = await prisma.setting.findMany();
    const map = new Map(rows.map((r) => [r.key, r.value]));
    return {
      announcementEnabled: map.get("announcementEnabled") === "true",
      announcementText: map.get("announcementText") ?? SETTINGS_DEFAULTS.announcementText,
      maintenanceEnabled: map.get("maintenanceEnabled") === "true",
      maintenanceText: map.get("maintenanceText") ?? SETTINGS_DEFAULTS.maintenanceText,
    };
  },
  ["site-settings"],
  { tags: ["site-settings"] }
);
