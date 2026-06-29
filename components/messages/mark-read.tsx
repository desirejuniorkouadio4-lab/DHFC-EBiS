"use client";

import { useEffect } from "react";
import { markConversationRead } from "@/lib/messages/actions";

/** Marque la conversation comme lue à l'ouverture (effet de montage). */
export function MarkRead({ conversationId }: { conversationId: string }) {
  useEffect(() => {
    void markConversationRead(conversationId);
  }, [conversationId]);
  return null;
}
