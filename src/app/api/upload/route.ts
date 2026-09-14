import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSession } from "@/lib/auth";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!(await getSession())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }

  const form = await request.formData();
  const file = form.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Archivo requerido" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return Response.json({ error: "Formato no permitido (jpg, png, webp, gif, svg)" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return Response.json({ error: "El archivo supera los 5MB" }, { status: 400 });
  }

  const ext = file.type.split("/")[1].replace("svg+xml", "svg");
  const name = `${Date.now()}-${randomBytes(4).toString("hex")}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, name), buffer);

  return Response.json({ url: `/uploads/${name}` }, { status: 201 });
}
