import "server-only";
import { cookies } from "next/headers";

/**
 * Impersonation admin (§ god-mode) : un ADMIN/SUPERADMIN peut « devenir » un
 * utilisateur quelconque. L'identité réelle reste dans le JWT ; la cible est
 * portée par un cookie httpOnly, n'est honorée que si le compte réel est admin
 * (cf. getSessionUser), et reste réversible.
 */
export const IMPERSONATE_COOKIE = "dhfc_impersonate";

export async function getImpersonatedId(): Promise<string | null> {
  const c = await cookies();
  return c.get(IMPERSONATE_COOKIE)?.value ?? null;
}

export async function setImpersonatedId(id: string): Promise<void> {
  const c = await cookies();
  c.set(IMPERSONATE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 h
  });
}

export async function clearImpersonation(): Promise<void> {
  const c = await cookies();
  c.delete(IMPERSONATE_COOKIE);
}
