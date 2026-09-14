import ComponentsManager from "@/components/admin/ComponentsManager";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getProductCategories, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminComponentsPage() {
  const session = await getSession();
  if (!session) return null;

  const providerId = session.providerId;
  const provider =
    session.role === "provider" && providerId ? await getProviderById(providerId) : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";

  const categories = await getProductCategories(providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Componentes</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <ComponentsManager categories={categories} />
    </div>
  );
}
