import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT provider_id FROM cms_banners WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  const body = await request.json();
  await db.query(
    `UPDATE cms_banners SET
       title = ?, subtitle = ?, image = ?, image_position = ?, text_position = ?,
       button_text = ?, button_link = ?,
       is_active = ?, sort_order = ?
     WHERE id = ?`,
    [
      body.title ?? "",
      body.subtitle ?? "",
      body.image ?? "",
      body.image_position ?? "right",
      body.text_position ?? "left",
      body.button_text ?? "",
      body.button_link ?? "",
      body.is_active ? 1 : 0,
      Number(body.sort_order ?? 0),
      Number(id),
    ]
  );
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT provider_id FROM cms_banners WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  await db.query("DELETE FROM cms_banners WHERE id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
