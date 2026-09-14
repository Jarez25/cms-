import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import StoreSection from "@/components/site/StoreSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getFooter,
  getHeader,
  getLocationComponents,
  getProviderBySlug,
  getSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ category?: string }> };

export default async function ProviderTiendaPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { category } = await searchParams;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;
  const [header, footer, settings, pageComponents] = await Promise.all([
    getHeader(provider.id),
    getFooter(provider.id),
    getSettings(),
    getLocationComponents(provider.id, "tienda"),
  ]);

  const currency = settings.currency || "S/. ";

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <main className="flex-1">
        <StoreSection
          currency={currency}
          productBase={`${basePath}/producto`}
          providerId={provider.id}
          pageSize={Number(settings.store_page_size) || 12}
          initialCategory={category ?? ""}
        />
        <ComponentBlocks
          components={pageComponents}
          currency={currency}
          productBase={`${basePath}/producto`}
          storeHref={`${basePath}/tienda`}
          providerId={provider.id}
        />
      </main>
      {footer && <SiteFooter footer={footer} />}
      <SiteBodyScripts providerId={provider.id} />
    </>
  );
}
