import { redirect } from "next/navigation";
import SettingsForm from "@/components/admin/SettingsForm";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await getSession();
  if (session?.role !== "superadmin") redirect("/admin");

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Ajustes generales</h1>
        <PreviewPanel path="/" />
      </div>
      <SettingsForm initial={settings} />
    </div>
  );
}
