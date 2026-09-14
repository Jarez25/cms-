import SiteHeader from "@/components/site/SiteHeader";
import StoreSection from "@/components/site/StoreSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getFooter, getHeader, getLocationComponents, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string }> };

export default async function TiendaPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [header, footer, settings, pageComponents] = await Promise.all([
    getHeader(null),
    getFooter(null),
    getSettings(),
    getLocationComponents(null, "tienda"),
  ]);

  const currency = settings.currency || "S/. ";

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <main className="flex-1">
        <StoreSection
          currency={currency}
          productBase="/producto"
          providerId={null}
          pageSize={Number(settings.store_page_size) || 12}
          initialCategory={category ?? ""}
        />
        <ComponentBlocks
          components={pageComponents}
          currency={currency}
          productBase="/producto"
          storeHref="/tienda"
          providerId={null}
        />
      </main>
      {footer && <SiteFooter footer={footer} />}
      <SiteBodyScripts providerId={null} />
    </>
  );
}
