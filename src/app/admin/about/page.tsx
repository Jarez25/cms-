import AboutForm from "@/components/admin/AboutForm";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getAbout, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminAboutPage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const previewPath = provider ? `/p/${provider.slug}/nosotros` : "/nosotros";

  const about = await getAbout(session.providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Nosotros</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <AboutForm
        initial={{
          title: about?.title ?? "",
          subtitle: about?.subtitle ?? "",
          content: about?.content ?? "",
          image: about?.image ?? "",
        }}
      />
    </div>
  );
}
