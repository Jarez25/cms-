import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getPages } from "@/lib/data";
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
  return Response.json(await getPages(scope.providerId));
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const title = String(body.title ?? "").trim();
  const slug = slugify(body.slug || title) || `pagina-${Date.now()}`;

  if (!title) {
    return Response.json({ error: "El título es requerido" }, { status: 400 });
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO cms_pages (provider_id, title, slug, content, components, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      scope.providerId,
      title,
      slug,
      body.content ?? "",
      JSON.stringify(Array.isArray(body.components) ? body.components : []),
      body.is_active === false || body.is_active === 0 ? 0 : 1,
    ]
  );
  return Response.json({ id: result.insertId, slug }, { status: 201 });
}
