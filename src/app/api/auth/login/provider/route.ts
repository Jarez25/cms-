import db from "@/lib/db";
import { makeToken, setAdminCookie, verifyPassword } from "@/lib/auth";
import type { RowDataPacket } from "mysql2";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return Response.json({ error: "Email y contraseña requeridos" }, { status: 400 });
  }

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, email, password_hash, role, is_active FROM cms_providers WHERE email = ? LIMIT 1",
    [String(email).trim().toLowerCase()]
  );

  if (!rows.length) {
    return Response.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const provider = rows[0];
  if (!provider.is_active) {
    return Response.json({ error: "Este proveedor está desactivado" }, { status: 403 });
  }
  if (!verifyPassword(String(password), String(provider.password_hash))) {
    return Response.json({ error: "Credenciales incorrectas" }, { status: 401 });
  }

  const role = provider.role === "superadmin" ? "superadmin" : "provider";
  await setAdminCookie(makeToken(Number(provider.id), role));
  return Response.json({ ok: true, role });
}
