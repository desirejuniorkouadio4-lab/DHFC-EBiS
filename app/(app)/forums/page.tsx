import { MessagesSquare } from "lucide-react";
import { EmptyState } from "@/components/lms/empty-state";

export default function ForumsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Forums</h1>
        <p className="text-[var(--text-secondary)]">
          Échangez avec votre cohorte et vos tuteurs par discipline.
        </p>
      </div>
      <EmptyState
        icon={MessagesSquare}
        badge="Bientôt disponible"
        title="Les forums disciplinaires arrivent"
        description="Vous pourrez poser vos questions, partager vos ressources et échanger avec la communauté des enseignants bivalents de sciences. Cette fonctionnalité fait partie du prochain sprint du LMS."
      />
    </div>
  );
}
