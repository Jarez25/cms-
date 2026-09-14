import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getCustomCode } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getCustomCode(scope.providerId));
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const cdnItems = JSON.stringify(body.cdn_items ?? []);
  const css = String(body.css ?? "");
  const jsHead = String(body.js_head ?? "");
  const jsBody = String(body.js_body ?? "");

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM cms_custom_code WHERE provider_id <=> ? LIMIT 1",
    [scope.providerId]
  );
  const existingId = rows[0]?.id ?? 0;

  await db.query(
    `INSERT INTO cms_custom_code (id, provider_id, cdn_items, css, js_head, js_body)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       cdn_items = VALUES(cdn_items),
       css = VALUES(css),
       js_head = VALUES(js_head),
       js_body = VALUES(js_body)`,
    [existingId, scope.providerId, cdnItems, css, jsHead, jsBody]
  );

  return Response.json(await getCustomCode(scope.providerId));
}
