import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT name, provider_id FROM cms_categories WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  const oldName = rows[0].name;
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "El nombre es requerido" }, { status: 400 });

  await db.query(
    "UPDATE cms_categories SET name = ?, description = ?, is_active = ?, is_hidden = ? WHERE id = ?",
    [
      name,
      body.description ?? "",
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_hidden ? 1 : 0,
      Number(id),
    ]
  );
  if (name !== oldName) {
    await db.query(
      "UPDATE cms_products SET category = ? WHERE provider_id <=> ? AND category = ?",
      [name, scope.providerId, oldName]
    );
  }
  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT name, provider_id FROM cms_categories WHERE id = ?",
    [Number(id)]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  await db.query("DELETE FROM cms_categories WHERE id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
