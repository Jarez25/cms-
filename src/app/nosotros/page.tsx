import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import AboutSection from "@/components/site/AboutSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getAbout, getFooter, getHeader, getLocationComponents, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [header, settings, about] = await Promise.all([
    getHeader(null),
    getSettings(),
    getAbout(null),
  ]);
  const siteName = header?.site_name || settings.site_title || "Mi Sitio";
  const title = `Sobre Nosotros | ${siteName}`;
  const description = about?.subtitle || about?.content?.slice(0, 160) || `Conoce más sobre la historia, misión y valores de ${siteName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export default async function NosotrosPage() {
  const [header, footer, about, settings, pageComponents] = await Promise.all([
    getHeader(null),
    getFooter(null),
    getAbout(null),
    getSettings(),
    getLocationComponents(null, "nosotros"),
  ]);

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <main className="flex-1">
        {about && <AboutSection about={about} />}
        <ComponentBlocks
          components={pageComponents}
          currency={settings.currency || "S/. "}
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
