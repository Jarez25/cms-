import MediaManager from "@/components/admin/MediaManager";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const session = await getSession();
  if (!session) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Multimedia</h1>
        <p className="text-gray-500 mt-1">
          Sube imágenes para usarlas en banners, productos o código personalizado.
        </p>
      </div>
      <MediaManager />
    </div>
  );
}
