import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import PageContent from "@/components/site/PageContent";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getComponents, getFooter, getHeader, getPageBySlug, getSettings } from "@/lib/data";
import type { ComponentData } from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageBySlug(slug, null);
  return page ? { title: page.title } : {};
}

export default async function PaginaPage({ params }: Props) {
  const { slug } = await params;
  const [page, header, footer, settings, components] = await Promise.all([
    getPageBySlug(slug, null),
    getHeader(null),
    getFooter(null),
    getSettings(),
    getComponents(null),
  ]);
  if (!page) notFound();

  const currency = settings.currency || "S/. ";
  const pageComponentList = (page.components ?? [])
    .map((id) => components.find((c) => c.id === id))
    .filter((c): c is ComponentData => !!c);

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
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
          productBase="/producto"
          storeHref="/tienda"
          providerId={null}
        />
        <ComponentBlocks
          components={pageComponentList}
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
