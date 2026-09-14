import SiteHeader from "@/components/site/SiteHeader";
import AboutSection from "@/components/site/AboutSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getAbout, getFooter, getHeader, getLocationComponents, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

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
