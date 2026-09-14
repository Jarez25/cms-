import ContactForm from "@/components/admin/ContactForm";
import PreviewPanel from "@/components/admin/PreviewPanel";
import { getSession } from "@/lib/auth";
import { getContact, getProviderById } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminContactPage() {
  const session = await getSession();
  if (!session) return null;

  const provider =
    session.role === "provider" && session.providerId
      ? await getProviderById(session.providerId)
      : null;
  const previewPath = provider ? `/p/${provider.slug}/contacto` : "/contacto";

  const contact = await getContact(session.providerId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Contacto</h1>
        <PreviewPanel path={previewPath} />
      </div>
      <ContactForm
        initial={{
          title: contact?.title ?? "",
          subtitle: contact?.subtitle ?? "",
          address: contact?.address ?? "",
          phone: contact?.phone ?? "",
          email: contact?.email ?? "",
          whatsapp: contact?.whatsapp ?? "",
          hours: contact?.hours ?? "",
          lat: contact?.lat ?? null,
          lng: contact?.lng ?? null,
          map_url: contact?.map_url ?? "",
        }}
      />
    </div>
  );
}
