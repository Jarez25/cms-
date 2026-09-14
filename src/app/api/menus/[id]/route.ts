import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getMenuById } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

async function findOwned(id: number, providerId: number | null) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, provider_id FROM cms_menus WHERE id = ?",
    [id]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== providerId) return null;
  return rows[0];
}

export async function GET(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const menu = await getMenuById(Number(id));
  if (!menu || (menu.provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  return Response.json(menu);
}

export async function PUT(request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const owned = await findOwned(Number(id), scope.providerId);
  if (!owned) return Response.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const isActive = body.is_active === false || body.is_active === 0 ? 0 : 1;
  const items = Array.isArray(body.items) ? body.items : [];

  await db.query(
    "UPDATE cms_menus SET name = ?, is_active = ?, items = ? WHERE id = ?",
    [name, isActive, JSON.stringify(items), Number(id)]
  );
  return Response.json(await getMenuById(Number(id)));
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const owned = await findOwned(Number(id), scope.providerId);
  if (!owned) return Response.json({ error: "No encontrado" }, { status: 404 });

  await db.query("DELETE FROM cms_menus WHERE id = ?", [Number(id)]);
  await db.query("UPDATE cms_header SET menu_id = NULL WHERE menu_id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
