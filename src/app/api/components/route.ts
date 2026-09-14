import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getComponents } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getComponents(scope.providerId));
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  if (!name) return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  const type = String(body.type ?? "html");
  const [result] = await db.query<ResultSetHeader>(
    "INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden) VALUES (?, ?, ?, ?, ?, ?)",
    [
      scope.providerId,
      name,
      type,
      JSON.stringify(body.props ?? {}),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_hidden ? 1 : 0,
    ]
  );
  return Response.json({ id: result.insertId }, { status: 201 });
}
