import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { getProviderById, getSettings } from "@/lib/data";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminLayout({
  children,
}: LayoutProps<"/admin">) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  let providerName: string | undefined;
  let providerSlug: string | undefined;
  if (session.role === "provider" && session.providerId) {
    const provider = await getProviderById(session.providerId);
    providerName = provider?.name;
    providerSlug = provider?.slug;
  }

  let logo = "";
  try {
    const settings = await getSettings();
    logo = settings.site_logo || "";
  } catch {
    logo = "";
  }

  return (
    <AdminShell
      role={session.role}
      providerName={providerName}
      providerSlug={providerSlug}
      logo={logo}
    >
      {children}
    </AdminShell>
  );
}
