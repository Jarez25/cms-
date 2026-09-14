import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getComponentById } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

async function findOwned(id: number, providerId: number | null) {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, provider_id FROM cms_components WHERE id = ?",
    [id]
  );
  if (!rows.length || (rows[0].provider_id ?? null) !== providerId) return null;
  return rows[0];
}

export async function GET(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const component = await getComponentById(Number(id));
  if (!component || (component.provider_id ?? null) !== scope.providerId) {
    return Response.json({ error: "No encontrado" }, { status: 404 });
  }
  return Response.json(component);
}

export async function PUT(request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const owned = await findOwned(Number(id), scope.providerId);
  if (!owned) return Response.json({ error: "No encontrado" }, { status: 404 });

  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  const type = String(body.type ?? "html");

  await db.query(
    "UPDATE cms_components SET name = ?, type = ?, props = ?, is_active = ?, is_hidden = ? WHERE id = ?",
    [
      name,
      type,
      JSON.stringify(body.props ?? {}),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_hidden ? 1 : 0,
      Number(id),
    ]
  );
  return Response.json(await getComponentById(Number(id)));
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  const owned = await findOwned(Number(id), scope.providerId);
  if (!owned) return Response.json({ error: "No encontrado" }, { status: 404 });

  await db.query("DELETE FROM cms_component_submissions WHERE component_id = ?", [Number(id)]);
  await db.query("DELETE FROM cms_components WHERE id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
