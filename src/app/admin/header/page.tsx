import HeaderForm from "@/components/admin/HeaderForm";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getHeader, getMenus, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminHeaderPage() {
  const session = await getSession();
  if (!session) return null;

  const providerId = session.providerId;
  const provider =
    session.role === "provider" && providerId ? await getProviderById(providerId) : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";

  const [header, menus] = await Promise.all([getHeader(providerId), getMenus(providerId)]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Header</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <HeaderForm
        initial={{
          site_name: header?.site_name ?? "",
          logo_text: header?.logo_text ?? "",
          logo_image: header?.logo_image ?? "",
          favicon: header?.favicon ?? "",
          phone: header?.phone ?? "",
          email: header?.email ?? "",
          menu_id: header?.menu_id ?? null,
          show_topbar: header?.show_topbar ?? 1,
          show_store_button: header?.show_store_button ?? 1,
          sticky: header?.sticky ?? 1,
          nav_items: header?.nav_items ?? [],
          social_links: header?.social_links ?? [],
        }}
        menus={menus.map((m) => ({ id: m.id, name: m.name, is_active: m.is_active }))}
      />
    </div>
  );
}
