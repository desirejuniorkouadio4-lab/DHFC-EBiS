import { Megaphone, Wrench } from "lucide-react";
import { getSiteSettings } from "@/lib/settings";

/** Bandeaux système (annonce, maintenance) affichés en haut de toutes les pages. */
export async function AnnouncementBanner() {
  const s = await getSiteSettings();
  if (!s.maintenanceEnabled && !(s.announcementEnabled && s.announcementText)) return null;

  return (
    <>
      {s.maintenanceEnabled && (
        <div className="bg-amber-500 px-4 py-2 text-center text-sm font-medium text-white">
          <Wrench className="mr-1.5 inline h-4 w-4 align-text-bottom" />
          {s.maintenanceText}
        </div>
      )}
      {s.announcementEnabled && s.announcementText && (
        <div className="bg-gradient-to-r from-orange-500 to-green-500 px-4 py-2 text-center text-sm font-medium text-white">
          <Megaphone className="mr-1.5 inline h-4 w-4 align-text-bottom" />
          {s.announcementText}
        </div>
      )}
    </>
  );
}
