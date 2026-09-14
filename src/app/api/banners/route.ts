import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getBanners } from "@/lib/data";
import type { ResultSetHeader } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getBanners(false, scope.providerId));
}

export async function POST(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const [result] = await db.query<ResultSetHeader>(
    `INSERT INTO cms_banners (provider_id, title, subtitle, image, image_position, text_position, button_text, button_link, is_active, is_hidden, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      scope.providerId,
      body.title ?? "",
      body.subtitle ?? "",
      body.image ?? "",
      body.image_position ?? "right",
      body.text_position ?? "left",
      body.button_text ?? "",
      body.button_link ?? "",
      body.is_active ? 1 : 0,
      body.is_hidden ? 1 : 0,
      Number(body.sort_order ?? 0),
    ]
  );
  return Response.json({ id: result.insertId }, { status: 201 });
}
