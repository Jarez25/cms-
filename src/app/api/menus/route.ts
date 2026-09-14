import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getMenus } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getMenus(scope.providerId));
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO cms_menus (provider_id, name, is_active, items) VALUES (?, ?, 1, '[]')",
    [scope.providerId, name]
  );
  return Response.json(
    { id: result.insertId, provider_id: scope.providerId, name, is_active: 1, items: [] },
    { status: 201 }
  );
}
