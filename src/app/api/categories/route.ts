import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getCategories } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

function slugify(text: string): string {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getCategories(scope.providerId));
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const name = String(body.name ?? "").trim();
  const slug = slugify(body.slug || name) || `categoria-${Date.now()}`;

  if (!name) {
    return Response.json({ error: "El nombre es requerido" }, { status: 400 });
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO cms_categories (provider_id, name, slug, description, is_active, is_hidden)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      scope.providerId,
      name,
      slug,
      body.description ?? "",
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      body.is_hidden ? 1 : 0,
    ]
  );
  return Response.json({ id: result.insertId, slug }, { status: 201 });
}
