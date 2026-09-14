import db from "@/lib/db";
import { getScope } from "@/lib/api-auth";
import { getLocationComponentIds } from "@/lib/data";

function key(providerId: number | null, location: string): string {
  return providerId === null ? `components_${location}` : `components_${location}_${providerId}`;
}

export async function GET(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const url = new URL(request.url);
  const location = url.searchParams.get("location") || "home";
  return Response.json(await getLocationComponentIds(scope.providerId, location));
}

export async function PUT(request: Request) {
  const scope = await getScope();
  if (!scope) return Response.json({ error: "No autorizado" }, { status: 401 });
  const body = await request.json();
  const location = String(body.location || "home");
  const ids = Array.isArray(body.ids)
    ? body.ids.map((n: unknown) => Number(n)).filter((n: number) => Number.isFinite(n) && n > 0)
    : [];
  await db.query(
    "INSERT INTO cms_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [key(scope.providerId, location), JSON.stringify(ids)]
  );
  return Response.json({ ok: true, ids });
}
