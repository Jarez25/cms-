import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import ProductDetail from "@/components/site/ProductDetail";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getFooter,
  getHeader,
  getProductBySlug,
  getProviderBySlug,
  getSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; productSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) return {};
  const product = await getProductBySlug(productSlug, provider.id);
  if (!product) return {};
  const header = await getHeader(provider.id);

  const siteName = header?.site_name || provider.name;
  const title = `${product.name} | ${siteName}`;
  const description =
    product.description?.slice(0, 160) ||
    `Compra ${product.name} en ${siteName}.`;

  return {
    title,
    description,
    ...(header?.favicon ? { icons: { icon: header.favicon } } : {}),
    openGraph: {
      title,
      description,
      type: "website",
      images: product.image ? [{ url: product.image, alt: product.name }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image ? [product.image] : [],
    },
  };
}

export default async function ProviderProductPage({ params }: Props) {
  const { slug, productSlug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;
  const [product, header, footer, settings] = await Promise.all([
    getProductBySlug(productSlug, provider.id),
    getHeader(provider.id),
    getFooter(provider.id),
    getSettings(),
  ]);
  if (!product) notFound();

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <ProductDetail
        product={product}
        currency={settings.currency || "S/. "}
        whatsapp={settings.whatsapp || ""}
        backHref={`${basePath}/tienda`}
      />
      {footer && <SiteFooter footer={footer} />}
      <SiteBodyScripts providerId={provider.id} />
    </>
  );
}
