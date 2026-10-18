import db from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { THEME_LIST, getSeasonTheme, type ThemeId } from "@/lib/theme";

export async function GET() {
  const settings: Record<string, string> = await getSettings().catch(() => ({}));
  const activeTheme = settings.active_theme || "default";
  return Response.json({
    activeTheme,
    themes: THEME_LIST,
  });
}

export async function PUT(request: Request) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const themeId = (body.themeId || "default") as ThemeId;
  const theme = getSeasonTheme(themeId);

  // Guardar en cms_settings de forma atómica
  const updates: Record<string, string> = {
    active_theme: theme.id,
    theme_primary: theme.palette.primary,
    theme_primary_light: theme.palette.light,
    theme_primary_dark: theme.palette.dark,
    theme_primary_soft: theme.palette.soft,
  };

  for (const [key, value] of Object.entries(updates)) {
    await db.query(
      `INSERT INTO cms_settings (\`key\`, \`value\`) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      [key, String(value)]
    );
  }

  return Response.json({
    success: true,
    activeTheme: theme.id,
    theme,
  });
}
