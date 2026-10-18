import { getSettings } from "@/lib/data";
import { PRESETS, getSeasonTheme } from "@/lib/theme";

export default async function ThemeColors() {
  let css = "";
  try {
    const settings = await getSettings();
    const activeThemeId = settings.active_theme || "default";
    const seasonTheme = getSeasonTheme(activeThemeId);

    // Si es default y el usuario tenía colores personalizados en settings, respetarlos
    let primary = seasonTheme.palette.primary;
    let light = seasonTheme.palette.light;
    let dark = seasonTheme.palette.dark;
    let soft = seasonTheme.palette.soft;

    if (activeThemeId === "default") {
      const preset = PRESETS[settings.theme_color || "indigo"] || PRESETS.indigo;
      primary = settings.theme_primary || preset.primary;
      light = settings.theme_primary_light || preset.light;
      dark = settings.theme_primary_dark || preset.dark;
      soft = settings.theme_primary_soft || preset.soft;
    }

    const accent = seasonTheme.palette.accent;
    const glow = seasonTheme.palette.glow;
    const gold = seasonTheme.palette.gold || "#f59e0b";

    css = `
      :root {
        --primary: ${primary};
        --primary-light: ${light};
        --primary-dark: ${dark};
        --primary-soft: ${soft};
        --season-accent: ${accent};
        --season-glow: ${glow};
        --season-gold: ${gold};
      }
      [data-theme="halloween"] ::selection {
        background: #ffedd5;
        color: #7c2d12;
      }
      [data-theme="christmas"] ::selection {
        background: #fee2e2;
        color: #7f1d1d;
      }
      [data-theme="valentine"] ::selection {
        background: #ffe4e6;
        color: #881337;
      }
    `.replace(/\s+/g, " ");
  } catch {
    css = "";
  }
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
