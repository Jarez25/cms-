import CodeEditor from "@/components/admin/CodeEditor";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getCustomCode, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminCodePage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";

  const code = await getCustomCode(session.providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Código personalizado</h1>
          <p className="text-gray-500 mt-1">
            Añade CDNs y escribe CSS/JS para tener control total sobre el diseño.
          </p>
        </div>
        <PreviewPanel path={previewPath} />
      </div>
      <CodeEditor
        initial={{
          cdn_items: code?.cdn_items ?? [],
          css: code?.css ?? "",
          js_head: code?.js_head ?? "",
          js_body: code?.js_body ?? "",
        }}
      />
    </div>
  );
}
