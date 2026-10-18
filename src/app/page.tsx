import SiteHeader from "@/components/site/SiteHeader";
import BannerSlider from "@/components/site/BannerSlider";
import CircularCategoryCarousel from "@/components/site/CircularCategoryCarousel";
import DiscountProductsSection from "@/components/site/DiscountProductsSection";
import LatestProductsSection from "@/components/site/LatestProductsSection";
import ProductCarousel from "@/components/site/ProductCarousel";
import CtaBanner from "@/components/site/CtaBanner";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getBanners,
  getDiscountedProducts,
  getFooter,
  getHeader,
  getHomeComponents,
  getLatestProducts,
  getProductsPaginated,
  getSettings,
  getTopCategories,
} from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    header,
    banners,
    footer,
    settings,
    topCats,
    featured,
    discountedProducts,
    latestProducts,
    homeComponents,
  ] = await Promise.all([
    getHeader(null),
    getBanners(true, null),
    getFooter(null),
    getSettings(),
    getTopCategories(null, 12),
    getProductsPaginated(null, { limit: 12 }),
    getDiscountedProducts(null, 8),
    getLatestProducts(null, 8),
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
        {/* Banner Hero */}
        <BannerSlider banners={banners} />

        {/* 1. Carrusel de Categorías Circulares (Burbujas Hermosas con Foto Redonda) */}
        <CircularCategoryCarousel
          items={topCats}
          basePath=""
          title="Explora Nuestras Colecciones"
          subtitle="Audio de alta fidelidad, periféricos mecánicos y accesorios de setup premium"
        />

        {/* 2. Sección de Productos en Descuento (Ofertas Flash con Badges) */}
        {discountedProducts.length > 0 && (
          <DiscountProductsSection
            products={discountedProducts}
            currency={currency}
            productBase="/producto"
            seeAllHref="/tienda"
          />
        )}

        {/* 3. Productos Destacados */}
        <ProductCarousel
          title="Productos Destacados"
          products={featured.items}
          currency={currency}
          productBase="/producto"
          seeAllHref="/tienda"
        />

        {/* 4. Sección de Últimos Agregados (Novedades) */}
        {latestProducts.length > 0 && (
          <LatestProductsSection
            products={latestProducts}
            currency={currency}
            productBase="/producto"
            seeAllHref="/tienda"
          />
        )}

        {/* Carruseles por Categoría */}
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

        {/* Banner CTA Personalizable */}
        {settings.cta_enabled !== "0" && (
          <CtaBanner
            badge={settings.cta_badge ?? "⭐ Oferta Especial"}
            title={settings.cta_title || "¿Buscas algo más?"}
            subtitle={
              settings.cta_subtitle ||
              "Explora nuestro catálogo completo con los mejores precios y envíos a todo el país."
            }
            buttonText={settings.cta_button_text || "Ver toda la tienda"}
            href={settings.cta_button_link || "/tienda"}
          />
        )}

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
