import db from "@/lib/db";
import { isSuperAdmin, hashPassword } from "@/lib/auth";
import { getProviders } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  return Response.json(await getProviders());
}

export async function POST(request: Request) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (!body.name || !email || password.length < 6) {
    return Response.json(
      { error: "Nombre, email válido y contraseña de al menos 6 caracteres son requeridos" },
      { status: 400 }
    );
  }

  const slug = slugify(body.slug || body.name);
  if (!slug) {
    return Response.json({ error: "Slug inválido" }, { status: 400 });
  }

  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO cms_providers (name, slug, email, password_hash, logo_image, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      body.name,
      slug,
      email,
      hashPassword(password),
      body.logo_image ?? "",
      body.is_active === false || body.is_active === 0 ? 0 : 1,
    ]
  );
  return Response.json({ id: result.insertId, slug }, { status: 201 });
}
