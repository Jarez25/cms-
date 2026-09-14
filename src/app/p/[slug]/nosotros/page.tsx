import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import AboutSection from "@/components/site/AboutSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getAbout,
  getFooter,
  getHeader,
  getLocationComponents,
  getProviderBySlug,
  getSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProviderNosotrosPage({ params }: Props) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;
  const [header, footer, about, settings, pageComponents] = await Promise.all([
    getHeader(provider.id),
    getFooter(provider.id),
    getAbout(provider.id),
    getSettings(),
    getLocationComponents(provider.id, "nosotros"),
  ]);

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <main className="flex-1">
        {about && <AboutSection about={about} />}
        <ComponentBlocks
          components={pageComponents}
          currency={settings.currency || "S/. "}
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
