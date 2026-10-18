import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { THEME_LIST } from "@/lib/theme";
import ThemesManager from "@/components/admin/ThemesManager";
import PreviewPanel from "@/components/admin/PreviewPanel";

export const dynamic = "force-dynamic";

export default async function AdminThemesPage() {
  const session = await getSession();
  if (session?.role !== "superadmin") {
    redirect("/admin");
  }

  const settings: Record<string, string> = await getSettings().catch(() => ({}));
  const activeTheme = settings.active_theme || "default";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Temas de Temporada
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Personaliza el aspecto general del sitio para campañas especiales (Halloween, Navidad, San Valentín o Estándar).
          </p>
        </div>
        <PreviewPanel path="/" />
      </div>

      <ThemesManager initialActiveTheme={activeTheme} themes={THEME_LIST} />
    </div>
  );
}
