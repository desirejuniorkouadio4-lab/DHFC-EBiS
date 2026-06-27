import { GraduationCap } from "lucide-react";
import { EnrolledCoursesGrid } from "@/components/lms/dashboard-widgets";
import { ParcoursCard } from "@/components/marketing/parcours-card";
import { Rail, RailItem } from "@/components/ui/rail";
import { getRecommended } from "@/lib/lms/data";
import { getMyEnrollments } from "@/lib/lms/db";
import { getSessionUser } from "@/lib/auth-helpers";

export default async function MesParcoursPage() {
  const user = await getSessionUser();
  if (!user) return null;
  const recommended = getRecommended();
  const enrollments = await getMyEnrollments(user.id);

  return (
    <div className="space-y-10">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 dark:bg-orange-500/10">
          <GraduationCap className="h-6 w-6" />
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Mes parcours</h1>
          <p className="text-[var(--text-secondary)]">
            {enrollments.length} parcours en cours dans votre cohorte.
          </p>
        </div>
      </div>

      <EnrolledCoursesGrid enrollments={enrollments} />

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
