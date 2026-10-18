import type { Metadata } from "next";
import SiteHeader from "@/components/site/SiteHeader";
import ContactSection from "@/components/site/ContactSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import { getContact, getFooter, getHeader, getLocationComponents, getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const [header, settings, contact] = await Promise.all([
    getHeader(null),
    getSettings(),
    getContact(null),
  ]);
  const siteName = header?.site_name || settings.site_title || "Mi Sitio";
  const title = `Contacto | ${siteName}`;
  const description =
    contact?.address || contact?.phone
      ? `Comunícate con ${siteName}. Teléfono: ${contact?.phone || ""} · Dirección: ${contact?.address || ""}`
      : `Ponte en contacto con nuestro equipo en ${siteName}.`;

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
