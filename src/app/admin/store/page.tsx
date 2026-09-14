import ProductsManager from "@/components/admin/ProductsManager";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminStorePage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const previewPath = provider ? `/p/${provider.slug}/tienda` : "/tienda";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tienda · Productos</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <ProductsManager />
    </div>
  );
}
