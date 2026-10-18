import type { MetadataRoute } from "next";
import db from "@/lib/db";
import type { RowDataPacket } from "mysql2";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tienda`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/nosotros`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    // 1. Productos activos del sitio principal
    const [products] = await db.query<RowDataPacket[]>(
      "SELECT slug, updated_at FROM cms_products WHERE is_active = 1 AND is_hidden = 0 AND provider_id IS NULL ORDER BY id DESC LIMIT 500"
    );
    const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
      url: `${baseUrl}/producto/${p.slug}`,
      lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // 2. Páginas personalizadas del sitio principal
    const [pages] = await db.query<RowDataPacket[]>(
      "SELECT slug, created_at FROM cms_pages WHERE is_active = 1 AND provider_id IS NULL ORDER BY id DESC LIMIT 200"
    );
    const pageRoutes: MetadataRoute.Sitemap = pages.map((page) => ({
      url: `${baseUrl}/pagina/${page.slug}`,
      lastModified: page.created_at ? new Date(page.created_at) : new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

    // 3. Portales y catálogos de proveedores
    const [providers] = await db.query<RowDataPacket[]>(
      "SELECT slug, updated_at FROM cms_providers WHERE is_active = 1 ORDER BY id DESC LIMIT 100"
    );
    const providerRoutes: MetadataRoute.Sitemap = [];
    for (const prov of providers) {
      providerRoutes.push({
        url: `${baseUrl}/p/${prov.slug}`,
        lastModified: prov.updated_at ? new Date(prov.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
      providerRoutes.push({
        url: `${baseUrl}/p/${prov.slug}/tienda`,
        lastModified: new Date(),
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }

    return [...staticRoutes, ...productRoutes, ...pageRoutes, ...providerRoutes];
  } catch {
    return staticRoutes;
  }
}
