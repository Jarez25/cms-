import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getProductsPaginated } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

export async function GET(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 20);
  const q = url.searchParams.get("q") || "";
  const category = url.searchParams.get("category") || "";
  const brand = url.searchParams.get("brand") || "";
  return Response.json(
    await getProductsPaginated(scope.providerId, {
      page,
      limit,
      q,
      category,
      brand,
      includeHidden: true,
    })
  );
}

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const slug = slugify(body.slug || body.name || `producto-${Date.now()}`);
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO cms_products (provider_id, name, slug, sku, description, price, image, category, brand, stock, is_active, is_hidden, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scope.providerId,
      body.name ?? "",
      slug,
      body.sku ?? "",
      body.description ?? "",
      Number(body.price ?? 0),
      body.image ?? "",
      body.category ?? "",
      body.brand ?? "",
      Number(body.stock ?? 0),
      body.is_active ? 1 : 0,
      body.is_hidden ? 1 : 0,
      Number(body.sort_order ?? 0),
    ]
  );
  return Response.json({ id: result.insertId, slug }, { status: 201 });
}
