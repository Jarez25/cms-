import MenusManager from "@/components/admin/MenusManager";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getPages, getProductCategories, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const session = await getSession();
  if (!session) return null;

  const providerId = session.providerId;
  const provider =
    session.role === "provider" && providerId ? await getProviderById(providerId) : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";
  const pageBase = provider ? `/p/${provider.slug}/pagina` : "/pagina";
  const categoryBase = provider ? `/p/${provider.slug}/tienda` : "/tienda";

  const [pages, categories] = await Promise.all([
    getPages(providerId, true),
    getProductCategories(providerId),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Menús</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <MenusManager
        pages={pages.map((p) => ({ title: p.title, slug: p.slug }))}
        categories={categories}
        pageBase={pageBase}
        categoryBase={categoryBase}
      />
    </div>
  );
}
