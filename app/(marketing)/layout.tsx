import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingBottomTabs } from "@/components/layout/marketing-bottom-tabs";
import { getSessionUser } from "@/lib/auth-helpers";
import { roleHomePath } from "@/lib/rbac";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  const session = user
    ? { initials: user.initials, avatarUrl: user.avatarUrl, homeHref: roleHomePath(user.role) }
    : null;
  return (
    <>
      <Header session={session} />
      <main id="contenu-principal">{children}</main>
      <Footer />
      <MarketingBottomTabs />
    </>
  );
}
