import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getContact } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getContact(scope.providerId));
}

function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM cms_contact WHERE provider_id <=> ? LIMIT 1",
    [scope.providerId]
  );
  const existingId = rows[0]?.id ?? 0;

  await db.query(
    `INSERT INTO cms_contact
       (id, provider_id, title, subtitle, address, phone, email, whatsapp, hours, lat, lng, map_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       title = VALUES(title),
       subtitle = VALUES(subtitle),
       address = VALUES(address),
       phone = VALUES(phone),
       email = VALUES(email),
       whatsapp = VALUES(whatsapp),
       hours = VALUES(hours),
       lat = VALUES(lat),
       lng = VALUES(lng),
       map_url = VALUES(map_url)`,
    [
      existingId,
      scope.providerId,
      body.title ?? "",
      body.subtitle ?? "",
      body.address ?? "",
      body.phone ?? "",
      body.email ?? "",
      body.whatsapp ?? "",
      body.hours ?? "",
      toNullableNumber(body.lat),
      toNullableNumber(body.lng),
      body.map_url ?? "",
    ]
  );

  return Response.json(await getContact(scope.providerId));
}
