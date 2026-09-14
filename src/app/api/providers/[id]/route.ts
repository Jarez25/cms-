import db from "@/lib/db";
import { isSuperAdmin, hashPassword } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const body = await request.json();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");

  if (password && password.length < 6) {
    return Response.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  await db.query(
    `UPDATE cms_providers SET
       name = ?, email = ?, logo_image = ?, is_active = ?
     WHERE id = ?`,
    [
      body.name ?? "",
      email,
      body.logo_image ?? "",
      body.is_active === false || body.is_active === 0 ? 0 : 1,
      Number(id),
    ]
  );

  if (password) {
    await db.query("UPDATE cms_providers SET password_hash = ? WHERE id = ?", [
      hashPassword(password),
      Number(id),
    ]);
  }

  return Response.json({ ok: true });
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const pid = Number(id);
  await db.query("DELETE FROM cms_providers WHERE id = ?", [pid]);
  await db.query("DELETE FROM cms_header WHERE provider_id = ?", [pid]);
  await db.query("DELETE FROM cms_banners WHERE provider_id = ?", [pid]);
  await db.query("DELETE FROM cms_products WHERE provider_id = ?", [pid]);
  await db.query("DELETE FROM cms_footer WHERE provider_id = ?", [pid]);
  return Response.json({ ok: true });
}

export async function GET(_request: Request, ctx: Ctx) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, slug, email, role, logo_image, is_active, created_at FROM cms_providers WHERE id = ? LIMIT 1",
    [Number(id)]
  );
  if (!rows.length) return Response.json({ error: "No encontrado" }, { status: 404 });
  return Response.json(rows[0]);
}
