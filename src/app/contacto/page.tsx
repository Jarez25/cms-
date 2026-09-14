import SiteHeader from "@/components/site/SiteHeader";
import ContactSection from "@/components/site/ContactSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getContact, getFooter, getHeader, getLocationComponents, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ContactoPage() {
  const [header, footer, contact, settings, pageComponents] = await Promise.all([
    getHeader(null),
    getFooter(null),
    getContact(null),
    getSettings(),
    getLocationComponents(null, "contacto"),
  ]);

  return (
    <>
      <SiteHeadAssets providerId={null} />
      {header && <SiteHeader header={header} />}
      <main className="flex-1">
        {contact && <ContactSection contact={contact} />}
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
