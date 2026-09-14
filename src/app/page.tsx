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
  getSettings,
  getTopCategories,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [header, banners, footer, settings, topCats, featured, homeComponents] =
    await Promise.all([
      getHeader(null),
      getBanners(true, null),
      getFooter(null),
      getSettings(),
      getTopCategories(null, 8),
      getProductsPaginated(null, { limit: 12 }),
      getHomeComponents(null),
    ]);

  const currency = settings.currency || "S/. ";
  const carouselCats = topCats.slice(0, 3);
  const carousels = await Promise.all(
    carouselCats.map((c) => getProductsPaginated(null, { category: c.category, limit: 10 }))
  );

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <main className="flex-1">
        <BannerSlider banners={banners} />
        <CategoryTiles items={topCats} basePath="" />
        <ProductCarousel
          title="Productos destacados"
          products={featured.items}
          currency={currency}
          productBase="/producto"
          seeAllHref="/tienda"
        />
        {carouselCats.map((c, i) => (
          <ProductCarousel
            key={c.category}
            title={c.category.split(">").pop()?.trim() || c.category}
            products={carousels[i].items}
            currency={currency}
            productBase="/producto"
            seeAllHref={`/tienda?category=${encodeURIComponent(c.category)}`}
          />
        ))}
        <CtaBanner
          title="¿Buscas algo más?"
          subtitle="Explora nuestro catálogo completo con los mejores precios y envíos a todo el país."
          buttonText="Ver toda la tienda"
          href="/tienda"
        />
        <ComponentBlocks
          components={homeComponents}
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
