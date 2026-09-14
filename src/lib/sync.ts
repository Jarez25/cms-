import db from "./db";
import type { ResultSetHeader, RowDataPacket } from "mysql2";

function slugify(text: unknown): string {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toNumber(value: unknown, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function toString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

export async function fetchJson(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      throw new Error(`El endpoint respondió ${res.status} ${res.statusText}`);
    }
    const data = await res.json();
    return Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  } finally {
    clearTimeout(timer);
  }
}

function pick(item: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    const value = item[key];
    if (value !== null && value !== undefined && value !== "") return value;
  }
  return null;
}

function firstImage(item: Record<string, unknown>): string {
  const urls = pick(item, "imageUrls", "image", "imagen", "foto");
  if (Array.isArray(urls)) return toString(urls[0]);
  return toString(urls);
}

function slugFor(item: Record<string, unknown>, fallbackIndex: number): string {
  const id = pick(item, "id");
  if (id !== null) return slugify(id);
  const pn = pick(item, "partNumber", "sku", "slug");
  if (pn !== null) return slugify(pn);
  const name = pick(item, "nombre", "name");
  return slugify(`${name}-${fallbackIndex}`) || `producto-${fallbackIndex}`;
}

async function upsertCategories(
  names: Set<string>,
  providerId: number | null
): Promise<number> {
  let count = 0;
  for (const name of names) {
    const slug = slugify(name);
    if (!slug) continue;
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id FROM cms_categories WHERE provider_id <=> ? AND slug = ? LIMIT 1",
      [providerId, slug]
    );
    if (rows.length) {
      await db.query("UPDATE cms_categories SET name = ?, is_active = 1 WHERE id = ?", [
        name,
        rows[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO cms_categories (provider_id, name, slug, description, is_active) VALUES (?, ?, ?, '', 1)",
        [providerId, name, slug]
      );
    }
    count++;
  }
  return count;
}

export interface ImportOptions {
  replace?: boolean;
  onlyWithStock?: boolean;
  providerId?: number | null;
}

export async function importProductsFromEndpoint(
  url: string,
  options: ImportOptions = {}
): Promise<{ imported: number; skipped: number; currency?: string; categories?: number }> {
  const { replace = false, onlyWithStock = true, providerId = null } = options;
  const items = await fetchJson(url);

  if (replace) {
    await db.query(
      providerId === null
        ? "DELETE FROM cms_products WHERE provider_id IS NULL"
        : "DELETE FROM cms_products WHERE provider_id = ?",
      providerId === null ? [] : [providerId]
    );
  }

  let imported = 0;
  let skipped = 0;
  let currency: string | undefined;
  const categories = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const stock = toNumber(pick(item, "stock", "cantidad", "quantity"));

    if (!currency) {
      currency = toString(pick(item, "simboloLocal", "currency", "moneda"));
    }

    if (onlyWithStock && stock <= 0) {
      skipped++;
      continue;
    }

    const name = toString(pick(item, "nombre", "name", "title"));
    const slug = slugFor(item, i);
    const sku = toString(pick(item, "partNumber", "sku", "codigo"));
    const description = toString(pick(item, "detalle", "descripcion", "description")) || name;
    const price = toNumber(
      pick(item, "PrecioNacional", "Total", "precioConvertido", "precio", "price")
    );
    const category = toString(pick(item, "subcategoria", "categoria", "category"));
    if (category) categories.add(category);
    const brand = toString(pick(item, "marca", "brand"));
    const image = firstImage(item);
    const isActive = stock > 0 ? 1 : 0;

    await db.query(
      `INSERT INTO cms_products
         (provider_id, name, slug, sku, description, price, image, category, brand, stock, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         sku = VALUES(sku),
         description = VALUES(description),
         price = VALUES(price),
         image = VALUES(image),
         category = VALUES(category),
         brand = VALUES(brand),
         stock = VALUES(stock),
         is_active = VALUES(is_active),
         sort_order = VALUES(sort_order)`,
      [
        providerId,
        name,
        slug,
        sku,
        description,
        price,
        image,
        category,
        brand,
        stock,
        isActive,
        i,
      ]
    );
    imported++;
  }
  const categoryCount = await upsertCategories(categories, providerId);
  return { imported, skipped, currency: currency || undefined, categories: categoryCount };
}

export interface SyncOptions {
  providerId?: number | null;
  deactivateMissing?: boolean;
  onlyWithStock?: boolean;
}

export interface SyncResult {
  updated: number;
  added: number;
  skipped: number;
  removed: number;
  currency?: string;
  categories?: number;
}

export async function syncProductsFromEndpoint(
  url: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const { providerId = null, deactivateMissing = false, onlyWithStock = true } = options;
  const items = await fetchJson(url);

  const [where, whereParams] =
    providerId === null
      ? (["provider_id IS NULL", []] as const)
      : (["provider_id = ?", [providerId]] as const);

  const [existingRows] = await db.query<RowDataPacket[]>(
    `SELECT id, slug FROM cms_products WHERE ${where}`,
    [...whereParams]
  );
  const bySlug = new Map<string, number>();
  for (const r of existingRows) {
    if (!bySlug.has(r.slug)) bySlug.set(r.slug, r.id);
  }

  let updated = 0;
  let added = 0;
  let skipped = 0;
  let currency: string | undefined;
  const categories = new Set<string>();
  const seenIds = new Set<number>();

  for (let i = 0; i < items.length; i++) {
    const item = items[i] as Record<string, unknown>;
    const stock = toNumber(pick(item, "stock", "cantidad", "quantity"));

    if (!currency) {
      currency = toString(pick(item, "simboloLocal", "currency", "moneda"));
    }

    const name = toString(pick(item, "nombre", "name", "title"));
    const slug = slugFor(item, i);
    const sku = toString(pick(item, "partNumber", "sku", "codigo"));
    const description = toString(pick(item, "detalle", "descripcion", "description")) || name;
    const price = toNumber(
      pick(item, "PrecioNacional", "Total", "precioConvertido", "precio", "price")
    );
    const category = toString(pick(item, "subcategoria", "categoria", "category"));
    if (category) categories.add(category);
    const brand = toString(pick(item, "marca", "brand"));
    const image = firstImage(item);
    const isActive = stock > 0 ? 1 : 0;

    const existingId = bySlug.get(slug);
    if (existingId != null) {
      seenIds.add(existingId);
      await db.query(
        `UPDATE cms_products
         SET name = ?, sku = ?, description = ?, price = ?, image = ?,
             category = ?, brand = ?, stock = ?, is_active = ?
         WHERE id = ?`,
        [name, sku, description, price, image, category, brand, stock, isActive, existingId]
      );
      updated++;
    } else if (onlyWithStock && stock <= 0) {
      skipped++;
    } else {
      const [result] = await db.query<ResultSetHeader>(
        `INSERT INTO cms_products
           (provider_id, name, slug, sku, description, price, image, category, brand, stock, is_active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [providerId, name, slug, sku, description, price, image, category, brand, stock, isActive, i]
      );
      bySlug.set(slug, result.insertId);
      added++;
    }
  }

  let removed = 0;
  if (deactivateMissing) {
    for (const r of existingRows) {
      if (!seenIds.has(r.id)) {
        await db.query("UPDATE cms_products SET is_active = 0, stock = 0 WHERE id = ?", [r.id]);
        removed++;
      }
    }
  }

  const categoryCount = await upsertCategories(categories, providerId);
  return { updated, added, skipped, removed, currency: currency || undefined, categories: categoryCount };
}

export async function importBannersFromEndpoint(url: string): Promise<number> {
  const items = await fetchJson(url);
  let imported = 0;
  for (const item of items) {
    await db.query(
      `INSERT INTO cms_banners (title, subtitle, image, button_text, button_link, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        toString(item.title),
        toString(item.subtitle),
        toString(item.image),
        toString(item.button_text),
        toString(item.button_link),
        item.is_active === false || item.is_active === 0 ? 0 : 1,
        toNumber(item.sort_order),
      ]
    );
    imported++;
  }
  return imported;
}
