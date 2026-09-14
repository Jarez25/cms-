import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getFooter as getFooterData } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getFooterData(scope.providerId));
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const socialLinks = JSON.stringify(body.social_links ?? []);

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM cms_footer WHERE provider_id <=> ? LIMIT 1",
    [scope.providerId]
  );
  const existingId = rows[0]?.id ?? 0;

  await db.query(
    `INSERT INTO cms_footer
       (id, provider_id, about_text, address, phone, email, copyright, social_links)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       about_text = VALUES(about_text),
       address = VALUES(address),
       phone = VALUES(phone),
       email = VALUES(email),
       copyright = VALUES(copyright),
       social_links = VALUES(social_links)`,
    [
      existingId,
      scope.providerId,
      body.about_text ?? "",
      body.address ?? "",
      body.phone ?? "",
      body.email ?? "",
      body.copyright ?? "",
      socialLinks,
    ]
  );

  return Response.json(await getFooterData(scope.providerId));
}
