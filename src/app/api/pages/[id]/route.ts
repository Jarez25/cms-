import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT provider_id FROM cms_pages WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  const body = await request.json();
  await db.query(
    `UPDATE cms_pages SET title = ?, content = ?, components = ?, is_active = ? WHERE id = ?`,
    [
      body.title ?? "",
      body.content ?? "",
      JSON.stringify(Array.isArray(body.components) ? body.components : []),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
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
    "SELECT provider_id FROM cms_pages WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  await db.query("DELETE FROM cms_pages WHERE id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
