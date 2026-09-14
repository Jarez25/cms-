import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageContent from "@/components/site/PageContent";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getComponents,
  getFooter,
  getHeader,
  getPageBySlug,
  getProviderBySlug,
  getSettings,
} from "@/lib/data";
import type { ComponentData } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string; pageSlug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, pageSlug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) return {};
  const page = await getPageBySlug(pageSlug, provider.id);
  return page ? { title: page.title } : {};
}

export default async function ProviderPaginaPage({ params }: Props) {
  const { slug, pageSlug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;
  const [page, header, footer, settings, components] = await Promise.all([
    getPageBySlug(pageSlug, provider.id),
    getHeader(provider.id),
    getFooter(provider.id),
    getSettings(),
    getComponents(provider.id),
  ]);
  if (!page) notFound();

  const currency = settings.currency || "S/. ";
  const pageComponentList = (page.components ?? [])
    .map((id) => components.find((c) => c.id === id))
    .filter((c): c is ComponentData => !!c);

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <main className="flex-1">
        <div className="container-site pt-12 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-8">
            {page.title}
          </h1>
        </div>
        <PageContent
          content={page.content}
          components={components}
          currency={currency}
          productBase={`${basePath}/producto`}
          storeHref={`${basePath}/tienda`}
          providerId={provider.id}
        />
        <ComponentBlocks
          components={pageComponentList}
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
