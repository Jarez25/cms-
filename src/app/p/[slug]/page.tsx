import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import BannerSlider from "@/components/site/BannerSlider";
import CategoryTiles from "@/components/site/CategoryTiles";
import ProductCarousel from "@/components/site/ProductCarousel";
import CtaBanner from "@/components/site/CtaBanner";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getBanners,
  getFooter,
  getHeader,
  getHomeComponents,
  getProductsPaginated,
  getProviderBySlug,
  getSettings,
  getTopCategories,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) return {};
  const header = await getHeader(provider.id);
  return {
    title: header?.site_name || provider.name,
    description: `Sitio de ${provider.name}`,
    ...(header?.favicon ? { icons: { icon: header.favicon } } : {}),
  };
}

export default async function ProviderSitePage({ params }: Props) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;

  const [header, banners, footer, settings, topCats, featured, homeComponents] =
    await Promise.all([
      getHeader(provider.id),
      getBanners(true, provider.id),
      getFooter(provider.id),
      getSettings(),
      getTopCategories(provider.id, 8),
      getProductsPaginated(provider.id, { limit: 12 }),
      getHomeComponents(provider.id),
    ]);

  const currency = settings.currency || "S/. ";
  const carouselCats = topCats.slice(0, 3);
  const carousels = await Promise.all(
    carouselCats.map((c) => getProductsPaginated(provider.id, { category: c.category, limit: 10 }))
  );

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <main className="flex-1">
        <BannerSlider banners={banners} />
        <CategoryTiles items={topCats} basePath={basePath} />
        <ProductCarousel
          title="Productos destacados"
          products={featured.items}
          currency={currency}
          productBase={`${basePath}/producto`}
          seeAllHref={`${basePath}/tienda`}
        />
        {carouselCats.map((c, i) => (
          <ProductCarousel
            key={c.category}
            title={c.category.split(">").pop()?.trim() || c.category}
            products={carousels[i].items}
            currency={currency}
            productBase={`${basePath}/producto`}
            seeAllHref={`${basePath}/tienda?category=${encodeURIComponent(c.category)}`}
          />
        ))}
        <CtaBanner
          title="¿Buscas algo más?"
          subtitle="Explora el catálogo completo de esta tienda."
          buttonText="Ver toda la tienda"
          href={`${basePath}/tienda`}
        />
        <ComponentBlocks
          components={homeComponents}
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
