import Link from "next/link";
import { ArrowRight, Trophy, Activity as ActivityIcon, CalendarClock } from "lucide-react";
import { ParcoursCard } from "@/components/marketing/parcours-card";
import { Rail, RailItem } from "@/components/ui/rail";
import {
  ContinueCard,
  StatsRow,
  EnrolledCoursesGrid,
  BadgesGallery,
  ActivityTimeline,
  PlanningList,
} from "@/components/lms/dashboard-widgets";
import { getRecommended } from "@/lib/lms/data";
import { getSessionUser } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const recommended = getRecommended();
  const user = await getSessionUser();

  return (
    <div className="space-y-10">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Bonjour {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-[var(--text-secondary)]">
          Vous êtes sur une série de {user?.streak} jours. Continuez sur votre lancée !
        </p>
      </div>

      {/* Continuer + Planning */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ContinueCard />
        </div>
        <Card title="Prochains rendez-vous" icon={CalendarClock}>
          <PlanningList />
        </Card>
      </div>

      {/* Statistiques */}
      <StatsRow />

      {/* Mes parcours */}
      <section>
        <SectionHeader title="Mes parcours" href="/mes-parcours" linkLabel="Voir tout" />
        <EnrolledCoursesGrid />
      </section>

      {/* Badges + Activité */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Mes badges" icon={Trophy} href="/profil" linkLabel="Profil">
          <BadgesGallery />
        </Card>
        <Card title="Activité récente" icon={ActivityIcon}>
          <ActivityTimeline />
        </Card>
      </div>

      {/* Recommandés */}
      <section>
        <SectionHeader title="Recommandés pour vous" href="/parcours" linkLabel="Catalogue" />
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

function SectionHeader({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between">
      <h2 className="text-xl font-bold">{title}</h2>
      <Link
        href={href}
        className="group inline-flex items-center gap-1 text-sm font-semibold text-orange-600 hover:text-orange-700"
      >
        {linkLabel}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  href,
  linkLabel,
  children,
}: {
  title: string;
  icon: typeof Trophy;
  href?: string;
  linkLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-bold">
          <Icon className="h-5 w-5 text-orange-500" />
          {title}
        </h2>
        {href && linkLabel && (
          <Link href={href} className="text-sm font-semibold text-orange-600 hover:text-orange-700">
            {linkLabel}
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}
