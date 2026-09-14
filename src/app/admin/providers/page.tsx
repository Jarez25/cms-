import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ProvidersManager from "@/components/admin/ProvidersManager";

export default async function AdminProvidersPage() {
  const session = await getSession();
  if (session?.role !== "superadmin") redirect("/admin");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Proveedores</h1>
        <p className="text-gray-500 mt-1">
          Cada proveedor tiene su propio sitio en /p/slug y su propio panel de edición.
        </p>
      </div>
      <ProvidersManager />
    </div>
  );
}
