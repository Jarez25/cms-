import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getHeader as getHeaderData } from "@/lib/data";
import type { RowDataPacket } from "mysql2";

export async function GET() {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  return Response.json(await getHeaderData(scope.providerId));
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const navItems = JSON.stringify(body.nav_items ?? []);
  const socialLinks = JSON.stringify(body.social_links ?? []);
  const menuId = body.menu_id == null || body.menu_id === "" ? null : Number(body.menu_id);
  const showTopbar = body.show_topbar === false || body.show_topbar === 0 ? 0 : 1;
  const showStoreButton = body.show_store_button === false || body.show_store_button === 0 ? 0 : 1;
  const sticky = body.sticky === false || body.sticky === 0 ? 0 : 1;

  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id FROM cms_header WHERE provider_id <=> ? LIMIT 1",
    [scope.providerId]
  );
  const existingId = rows[0]?.id ?? 0;

  await db.query(
    `INSERT INTO cms_header
       (id, provider_id, site_name, logo_text, logo_image, favicon, phone, email, menu_id, show_topbar, show_store_button, sticky, nav_items, social_links)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       site_name = VALUES(site_name),
       logo_text = VALUES(logo_text),
       logo_image = VALUES(logo_image),
       favicon = VALUES(favicon),
       phone = VALUES(phone),
       email = VALUES(email),
       menu_id = VALUES(menu_id),
       show_topbar = VALUES(show_topbar),
       show_store_button = VALUES(show_store_button),
       sticky = VALUES(sticky),
       nav_items = VALUES(nav_items),
       social_links = VALUES(social_links)`,
    [
      existingId,
      scope.providerId,
      body.site_name ?? "",
      body.logo_text ?? "",
      body.logo_image ?? "",
      body.favicon ?? "",
      body.phone ?? "",
      body.email ?? "",
      menuId,
      showTopbar,
      showStoreButton,
      sticky,
      navItems,
      socialLinks,
    ]
  );

  return Response.json(await getHeaderData(scope.providerId));
}
