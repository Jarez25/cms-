import { getSettings } from "@/lib/data";
import { PRESETS } from "@/lib/theme";

export default async function ThemeColors() {
  let css = "";
  try {
    const settings = await getSettings();
    const preset = PRESETS[settings.theme_color || "indigo"] || PRESETS.indigo;
    const primary = settings.theme_primary || preset.primary;
    const light = settings.theme_primary_light || preset.light;
    const dark = settings.theme_primary_dark || preset.dark;
    const soft = settings.theme_primary_soft || preset.soft;
    css = `:root{--primary:${primary};--primary-light:${light};--primary-dark:${dark};--primary-soft:${soft};}`;
  } catch {
    css = "";
  }
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
