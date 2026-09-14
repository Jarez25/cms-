import BannersManager from "@/components/admin/BannersManager";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Banners</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <BannersManager />
    </div>
  );
}
