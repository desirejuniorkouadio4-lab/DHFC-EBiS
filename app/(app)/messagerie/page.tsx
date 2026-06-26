import { Mail } from "lucide-react";
import { EmptyState } from "@/components/lms/empty-state";

export default function MessageriePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Messagerie</h1>
        <p className="text-[var(--text-secondary)]">
          Communiquez en privé avec votre tuteur et les autres apprenants.
        </p>
      </div>
      <EmptyState
        icon={Mail}
        badge="Bientôt disponible"
        title="La messagerie temps réel arrive"
        description="Conversations privées, indicateurs de lecture et notifications instantanées avec votre tuteur attitré. Cette fonctionnalité sera connectée lors du sprint Collaboration."
      />
    </div>
  );
}
