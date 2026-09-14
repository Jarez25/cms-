import { getSession } from "@/lib/auth";
import { getProviderById } from "@/lib/data";
import PagesManager from "@/components/admin/PagesManager";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const basePath = provider ? `/p/${provider.slug}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Páginas</h1>
        <p className="text-gray-500 mt-1">
          Crea páginas personalizadas y añádelas al menú del header.
        </p>
      </div>
      <PagesManager basePath={basePath} />
    </div>
  );
}
