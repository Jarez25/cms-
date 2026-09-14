import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getAbout } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getAbout(scope.providerId));
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM cms_about WHERE provider_id <=> ? LIMIT 1",
    [scope.providerId]
  );
  const existingId = rows[0]?.id ?? 0;

  await db.query(
    `INSERT INTO cms_about (id, provider_id, title, subtitle, content, image)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       subtitle = VALUES(subtitle),
       content = VALUES(content),
       image = VALUES(image)`,
    [
      existingId,
      scope.providerId,
      body.title ?? "",
      body.subtitle ?? "",
      body.content ?? "",
      body.image ?? "",
    ]
  );

  return Response.json(await getAbout(scope.providerId));
}
