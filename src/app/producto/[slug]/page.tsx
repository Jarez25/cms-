import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ProductDetail from "@/components/site/ProductDetail";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getFooter, getHeader, getProductBySlug, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug, null);
  if (!product) return {};
  const header = await getHeader(null);
  const settings = await getSettings();
  return {
    title: `${product.name} - ${header?.site_name || settings.site_title || "Mi Sitio"}`,
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const [product, header, footer, settings] = await Promise.all([
    getProductBySlug(slug, null),
    getHeader(null),
    getFooter(null),
    getSettings(),
  ]);
  if (!product) notFound();

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <ProductDetail
        product={product}
        currency={settings.currency || "S/. "}
        whatsapp={settings.whatsapp || ""}
        backHref="/tienda"
      />
      {footer && <SiteFooter footer={footer} />}
      <SiteBodyScripts providerId={null} />
    </>
  );
}
