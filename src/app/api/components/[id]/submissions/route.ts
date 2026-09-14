import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { parseJson } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, data, created_at FROM cms_component_submissions WHERE component_id = ? ORDER BY id DESC LIMIT 100",
    [Number(id)]
  );
  return Response.json(
    rows.map((r) => ({ id: r.id, data: parseJson(r.data, {}), created_at: r.created_at }))
  );
}

export async function DELETE(_request: Request, ctx: Ctx) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await ctx.params;
  await db.query("DELETE FROM cms_component_submissions WHERE component_id = ?", [Number(id)]);
  return Response.json({ ok: true });
}
