import { notFound } from "next/navigation";
import SiteHeader from "@/components/site/SiteHeader";
import ContactSection from "@/components/site/ContactSection";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import SiteFooter from "@/components/site/SiteFooter";
import { SiteHeadAssets, SiteBodyScripts } from "@/components/site/SiteAssets";
import {
  getContact,
  getFooter,
  getHeader,
  getLocationComponents,
  getProviderBySlug,
  getSettings,
} from "@/lib/data";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export default async function ProviderContactoPage({ params }: Props) {
  const { slug } = await params;
  const provider = await getProviderBySlug(slug);
  if (!provider) notFound();

  const basePath = `/p/${provider.slug}`;
  const [header, footer, contact, settings, pageComponents] = await Promise.all([
    getHeader(provider.id),
    getFooter(provider.id),
    getContact(provider.id),
    getSettings(),
    getLocationComponents(provider.id, "contacto"),
  ]);

  return (
    <>
      <SiteHeadAssets providerId={provider.id} />
      {header && (
        <SiteHeader header={header} fallbackLogo={provider.logo_image} basePath={basePath} />
      )}
      <main className="flex-1">
        {contact && <ContactSection contact={contact} />}
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
