import db from "@/lib/db";
import { isSuperAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import {
  fetchJson,
  importBannersFromEndpoint,
  importProductsFromEndpoint,
  syncProductsFromEndpoint,
} from "@/lib/sync";

async function saveSetting(key: string, value: string) {
  await db.query(
    "INSERT INTO cms_settings (`key`, `value`) VALUES (?, ?) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`)",
    [key, value]
  );
}

export async function GET() {
  const settings = await getSettings();
  return Response.json({
    endpoint_url: settings.endpoint_url || "",
    endpoint_section: settings.endpoint_section || "products",
    endpoint_last_sync: settings.endpoint_last_sync || "",
  });
}

export async function POST(request: Request) {
  if (!(await isSuperAdmin())) {
    return Response.json({ error: "No autorizado" }, { status: 401 });
  }
  const body = await request.json();
  const url = String(body.url || "").trim();
  const section = body.section === "banners" ? "banners" : "products";

  if (!/^https?:\/\//.test(url)) {
    return Response.json({ error: "La URL debe empezar con http:// o https://" }, { status: 400 });
  }

  if (body.action === "test") {
    try {
      const items = await fetchJson(url);
      const sample = items[0] ? Object.keys(items[0]) : [];
      return Response.json({
        ok: true,
        total: items.length,
        sampleKeys: sample.slice(0, 15),
      });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 422 });
    }
  }

  if (body.action === "import") {
    try {
      if (section === "banners") {
        const count = await importBannersFromEndpoint(url);
        await saveSetting("endpoint_url", url);
        await saveSetting("endpoint_section", section);
        await saveSetting("endpoint_last_sync", new Date().toISOString());
        return Response.json({ ok: true, imported: count });
      }

      const result = await importProductsFromEndpoint(url, {
        replace: true,
        onlyWithStock: body.onlyWithStock !== false,
        providerId: null,
      });
      await saveSetting("endpoint_url", url);
      await saveSetting("endpoint_section", section);
      await saveSetting("endpoint_last_sync", new Date().toISOString());
      if (result.currency) {
        await saveSetting("currency", result.currency);
      }
      return Response.json({ ok: true, ...result });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 422 });
    }
  }

  if (body.action === "sync") {
    try {
      const result = await syncProductsFromEndpoint(url, {
        providerId: null,
        deactivateMissing: !!body.deactivateMissing,
        onlyWithStock: body.onlyWithStock !== false,
      });
      await saveSetting("endpoint_url", url);
      await saveSetting("endpoint_section", "products");
      await saveSetting("endpoint_last_sync", new Date().toISOString());
      if (result.currency) {
        await saveSetting("currency", result.currency);
      }
      return Response.json({ ok: true, ...result });
    } catch (err) {
      return Response.json({ error: (err as Error).message }, { status: 422 });
    }
  }

  return Response.json({ error: "Acción inválida" }, { status: 400 });
}
