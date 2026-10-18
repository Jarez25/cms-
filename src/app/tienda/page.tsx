import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import StoreSection from "@/components/site/StoreSection";
import CircularCategoryCarousel from "@/components/site/CircularCategoryCarousel";
import DiscountProductsSection from "@/components/site/DiscountProductsSection";
import LatestProductsSection from "@/components/site/LatestProductsSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getDiscountedProducts,
  getFooter,
  getHeader,
  getLatestProducts,
  getLocationComponents,
  getSettings,
  getTopCategories,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ category?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { category } = await searchParams;
  const [header, settings] = await Promise.all([getHeader(null), getSettings()]);
  const siteName = header?.site_name || settings.site_title || "Mi Sitio";
  const title = category ? `${category} | Tienda - ${siteName}` : `Tienda Online | Catálogo - ${siteName}`;
  const description = `Explora nuestro catálogo en línea en ${siteName}. Los mejores productos al mejor precio con entrega rápida.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function TiendaPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const [
    header,
    footer,
    settings,
    categories,
    discountedProducts,
    latestProducts,
    pageComponents,
  ] = await Promise.all([
    getHeader(null),
    getFooter(null),
    getSettings(),
    getTopCategories(null, 12),
    getDiscountedProducts(null, 8),
    getLatestProducts(null, 8),
    getLocationComponents(null, "tienda"),
  ]);

  const currency = settings.currency || "S/. ";

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <main className="flex-1">
        {/* 1. Carrusel de Categorías Circulares (Burbujas Hermosas) */}
        <CircularCategoryCarousel
          items={categories}
          basePath=""
          activeCategory={category ?? ""}
          title="Categorías Destacadas"
          subtitle="Toca una categoría para explorar los productos de esa colección"
        />

        {/* 2. Sección de Productos en Descuento (si no hay filtro de categoría activo) */}
        {!category && discountedProducts.length > 0 && (
          <DiscountProductsSection
            products={discountedProducts}
            currency={currency}
            productBase="/producto"
            seeAllHref="/tienda"
          />
        )}

        {/* 3. Sección de Últimos Agregados (Novedades) */}
        {!category && latestProducts.length > 0 && (
          <LatestProductsSection
            products={latestProducts}
            currency={currency}
            productBase="/producto"
            seeAllHref="/tienda"
          />
        )}

        {/* 4. Catálogo Completo Despejado y Elegante */}
        <StoreSection
          currency={currency}
          productBase="/producto"
          providerId={null}
          pageSize={Number(settings.store_page_size) || 16}
          initialCategory={category ?? ""}
        />

        {/* Bloques de componentes configurados */}
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
