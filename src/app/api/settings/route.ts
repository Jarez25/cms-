import db from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";

export async function GET() {
  return Response.json(await getSettings());
}

export async function PUT(request: Request) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body: Record<string, string> = await request.json();
  for (const [key, value] of Object.entries(body)) {
    await db.query(
      `INSERT INTO cms_settings (\`key\`, \`value\`) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`)`,
      [key, String(value ?? "")]
    );
  }
  return Response.json(await getSettings());
}
