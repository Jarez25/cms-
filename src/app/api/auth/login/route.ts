import { createHash } from "crypto";
import { makeToken, setAdminCookie, verifyPassword } from "@/lib/auth";
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) {
    return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, email, password_hash, role, is_active FROM cms_providers WHERE email = ? AND role = 'superadmin' LIMIT 1",
    [String(email).trim().toLowerCase()]
  );

  if (rows.length) {
    const admin = rows[0];
    if (!admin.is_active) {
      return Response.json({ error: "Este administrador está desactivado" }, { status: 403 });
    }
    if (verifyPassword(String(password), String(admin.password_hash))) {
      await setAdminCookie(makeToken(Number(admin.id), "superadmin"));
      return Response.json({ ok: true, role: "superadmin" });
    }
  }

  const expected = process.env.ADMIN_PASSWORD || "admin123";
  const candidate = createHash("sha256").update(password || "").digest("hex");
  const expectedHash = createHash("sha256").update(expected).digest("hex");

  if (candidate === expectedHash) {
    await setAdminCookie(makeToken(0, "superadmin"));
    return Response.json({ ok: true, role: "superadmin" });
  }

  return Response.json({ error: "Credenciales incorrectas" }, { status: 401 });
}
