import { readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { getScope } from "@/lib/api-auth";

const dir = path.join(process.cwd(), "public", "uploads");

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });

  try {
    const names = await readdir(dir);
    const items: { name: string; url: string; size: number; updated: number }[] = [];
    for (const name of names) {
      const full = path.join(dir, name);
      const s = await stat(full);
      if (s.isFile()) {
        items.push({ name, url: `/uploads/${name}`, size: s.size, updated: s.mtimeMs });
      }
    }
    items.sort((a, b) => b.updated - a.updated);
    return Response.json(items);
  } catch {
    return Response.json([]);
  }
}

export async function DELETE(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });

  const { name } = await request.json().catch(() => ({}));
  if (
    !name ||
    typeof name !== "string" ||
    name.includes("/") ||
    name.includes("\\") ||
    name.includes("..")
  ) {
    return Response.json({ error: "Nombre inválido" }, { status: 400 });
  }

  try {
    await unlink(path.join(dir, name));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "No se pudo eliminar" }, { status: 404 });
  }
}
