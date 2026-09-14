import FooterForm from "@/components/admin/FooterForm";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getFooter, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminFooterPage() {
  const session = await getSession();
  if (!session) return null;

  const providerId = session.providerId;
  const provider =
    session.role === "provider" && providerId ? await getProviderById(providerId) : null;
  const previewPath = provider ? `/p/${provider.slug}` : "/";

  const footer = await getFooter(providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Editar Footer</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <FooterForm
        initial={{
          about_text: footer?.about_text ?? "",
          address: footer?.address ?? "",
          phone: footer?.phone ?? "",
          email: footer?.email ?? "",
          copyright: footer?.copyright ?? "",
          social_links: footer?.social_links ?? [],
        }}
      />
    </div>
  );
}
