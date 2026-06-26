import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MarketingBottomTabs } from "@/components/layout/marketing-bottom-tabs";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="contenu-principal">{children}</main>
      <Footer />
      <MarketingBottomTabs />
    </>
  );
}
