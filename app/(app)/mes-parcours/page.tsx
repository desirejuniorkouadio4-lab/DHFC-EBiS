import { GraduationCap } from "lucide-react";
import { EnrolledCoursesGrid } from "@/components/lms/dashboard-widgets";
import { ParcoursCard } from "@/components/marketing/parcours-card";
import { Rail, RailItem } from "@/components/ui/rail";
import { ENROLLMENTS, getRecommended } from "@/lib/lms/data";

export default function MesParcoursPage() {
  const recommended = getRecommended();

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
          <GraduationCap className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes parcours</h1>
          <p className="text-[var(--text-secondary)]">
            {ENROLLMENTS.length} parcours en cours dans votre cohorte.
          </p>
        </div>
      </div>

      <EnrolledCoursesGrid />

      <section>
        <h2 className="mb-5 text-xl font-bold">Explorer d'autres parcours</h2>
        <Rail cols="lg:grid-cols-3 lg:gap-5">
          {recommended.map((p) => (
            <RailItem key={p.slug} width="w-[66%] sm:w-[44%]">
              <ParcoursCard parcours={p} />
            </RailItem>
          ))}
        </Rail>
      </section>
    </div>
  );
}
