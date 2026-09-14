import LoginForm from "@/components/admin/LoginForm";
import { getSettings } from "@/lib/data";

export default async function LoginPage() {
  let logo = "";
  try {
    const settings = await getSettings();
    logo = settings.site_logo || "";
  } catch {
    logo = "";
  }
  return <LoginForm logo={logo} />;
}
