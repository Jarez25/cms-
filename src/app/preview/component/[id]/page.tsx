import { getComponentById, getProviderById, getSettings } from "@/lib/data";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import ComponentBlocks from "@/components/site/ComponentBlocks";
import { SiteHeadAssets } from "@/components/site/SiteAssets";

export const dynamic = "force-dynamic";

export default async function ComponentPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { id } = await params;
  const component = await getComponentById(Number(id));

  if (!component || (component.provider_id ?? null) !== session.providerId) {
    return (
      <div style={{ padding: 32, color: "#6b7280", textAlign: "center" }}>
        Componente no encontrado.
      </div>
    );
  }

  const settings = await getSettings();
  const currency = settings.currency || "S/. ";

  let prefix = "";
  if (session.role === "provider" && session.providerId) {
    const provider = await getProviderById(session.providerId);
    prefix = provider ? `/p/${provider.slug}` : "";
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      <SiteHeadAssets providerId={session.providerId} />
      <ComponentBlocks
        components={[component]}
        currency={currency}
        productBase={`${prefix}/producto`}
        storeHref={`${prefix}/tienda`}
        providerId={session.providerId}
      />
    </div>
  );
}
