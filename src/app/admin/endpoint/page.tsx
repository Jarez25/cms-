import { redirect } from "next/navigation";
import EndpointManager from "@/components/admin/EndpointManager";
import { getSession } from "@/lib/auth";

export default async function AdminEndpointPage() {
  const session = await getSession();
  if (session?.role !== "superadmin") redirect("/admin");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Endpoint externo</h1>
      <EndpointManager />
    </div>
  );
}
