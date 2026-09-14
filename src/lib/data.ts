import db from "./db";
import type { RowDataPacket } from "mysql2";

export interface NavItem {
  label: string;
  href: string;
}

export interface SocialLink {
  label: string;
  url: string;
}

export interface MenuItem {
  id: string;
  label: string;
  href: string;
  children: MenuItem[];
}

export interface MenuData {
  id: number;
  provider_id: number | null;
  name: string;
  is_active: number;
  items: MenuItem[];
}

export interface HeaderData {
  id: number;
  provider_id: number | null;
  site_name: string;
  logo_text: string;
  logo_image: string;
  favicon: string;
  phone: string;
  email: string;
  nav_items: NavItem[];
  social_links: SocialLink[];
  menu_id: number | null;
  show_topbar: number;
  show_store_button: number;
  sticky: number;
  menu: MenuItem[];
}

export interface BannerData {
  id: number;
  provider_id: number | null;
  title: string;
  subtitle: string;
  image: string;
  image_position: string;
  text_position: string;
  button_text: string;
  button_link: string;
  is_active: number;
  is_hidden: number;
  sort_order: number;
}

export interface ProductData {
  id: number;
  provider_id: number | null;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  is_active: number;
  is_hidden: number;
  sort_order: number;
}

export interface FooterData {
  id: number;
  provider_id: number | null;
  about_text: string;
  address: string;
  phone: string;
  email: string;
  copyright: string;
  social_links: SocialLink[];
}

export interface PageData {
  id: number;
  provider_id: number | null;
  title: string;
  slug: string;
  content: string;
  components: number[];
  is_active: number;
  created_at: string;
}

export interface CategoryData {
  id: number;
  provider_id: number | null;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  is_hidden: number;
}

export async function getCategories(
  providerId: number | null,
  onlyActive = false
): Promise<CategoryData[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, provider_id, name, slug, description, is_active, is_hidden
     FROM cms_categories WHERE ${where} ${active} ORDER BY name ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
  }));
}

export async function getPages(
  providerId: number | null,
  onlyActive = false
): Promise<PageData[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, provider_id, title, slug, content, components, is_active, created_at
     FROM cms_pages WHERE ${where} ${active} ORDER BY id ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    components: parseJson<number[]>(row.components, []),
    is_active: row.is_active,
    created_at: row.created_at,
  }));
}

export async function getPageBySlug(
  slug: string,
  providerId: number | null
): Promise<PageData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, provider_id, title, slug, content, components, is_active, created_at
     FROM cms_pages WHERE ${where} AND slug = ? AND is_active = 1 LIMIT 1`,
    [...params, slug]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    components: parseJson<number[]>(row.components, []),
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export interface CdnItem {
  url: string;
  type: "css" | "js";
}

export interface CustomCodeData {
  id: number;
  provider_id: number | null;
  cdn_items: CdnItem[];
  css: string;
  js_head: string;
  js_body: string;
}

export interface AboutData {
  id: number;
  provider_id: number | null;
  title: string;
  subtitle: string;
  content: string;
  image: string;
}

export interface ContactData {
  id: number;
  provider_id: number | null;
  title: string;
  subtitle: string;
  address: string;
  phone: string;
  email: string;
  whatsapp: string;
  hours: string;
  lat: number | null;
  lng: number | null;
  map_url: string;
}

export interface ProviderData {
  id: number;
  name: string;
  slug: string;
  email: string;
  role: string;
  logo_image: string;
  is_active: number;
  created_at: string;
}

export function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

function providerWhere(providerId: number | null): [string, unknown[]] {
  return providerId === null
    ? ["provider_id IS NULL", []]
    : ["provider_id = ?", [providerId]];
}

const PRODUCT_VISIBLE_SQL = `cms_products.is_hidden = 0 AND NOT EXISTS (
  SELECT 1 FROM cms_categories hc
  WHERE hc.provider_id <=> cms_products.provider_id
    AND hc.name = cms_products.category
    AND hc.is_hidden = 1
)`;

export async function getHeader(providerId: number | null = null): Promise<HeaderData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_header WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows.length) return null;
  const row = rows[0];
  const menuId = row.menu_id == null ? null : Number(row.menu_id);

  let menu: MenuItem[] = [];
  if (menuId !== null) {
    const assigned = await getMenuById(menuId);
    if (assigned && assigned.is_active) menu = assigned.items;
  }
  if (menu.length === 0) {
    menu = parseJson<NavItem[]>(row.nav_items, []).map((n, i) => ({
      id: `legacy-${i}`,
      label: n.label,
      href: n.href,
      children: [],
    }));
  }

  return {
    id: row.id,
    provider_id: row.provider_id,
    site_name: row.site_name,
    logo_text: row.logo_text,
    logo_image: row.logo_image,
    favicon: row.favicon,
    phone: row.phone,
    email: row.email,
    nav_items: parseJson<NavItem[]>(row.nav_items, []),
    social_links: parseJson<SocialLink[]>(row.social_links, []),
    menu_id: menuId,
    show_topbar: row.show_topbar == null ? 1 : Number(row.show_topbar),
    show_store_button: row.show_store_button == null ? 1 : Number(row.show_store_button),
    sticky: row.sticky == null ? 1 : Number(row.sticky),
    menu,
  };
}

function normalizeMenuItems(items: unknown): MenuItem[] {
  if (!Array.isArray(items)) return [];
  return items.map((it) => ({
    id: String(it.id ?? `m-${Math.random().toString(36).slice(2, 9)}`),
    label: String(it.label ?? ""),
    href: String(it.href ?? "#"),
    children: normalizeMenuItems(it.children),
  }));
}

export async function getMenus(providerId: number | null): Promise<MenuData[]> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, provider_id, name, is_active, items FROM cms_menus WHERE ${where} ORDER BY id ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    is_active: Number(row.is_active),
    items: normalizeMenuItems(row.items),
  }));
}

export async function getMenuById(id: number): Promise<MenuData | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, provider_id, name, is_active, items FROM cms_menus WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    is_active: Number(row.is_active),
    items: normalizeMenuItems(row.items),
  };
}

export async function getBanners(
  onlyActive = false,
  providerId: number | null = null
): Promise<BannerData[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1 AND is_hidden = 0" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_banners WHERE ${where} ${active} ORDER BY sort_order ASC, id ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    subtitle: row.subtitle,
    image: row.image,
    image_position: row.image_position ?? "right",
    text_position: row.text_position ?? "left",
    button_text: row.button_text,
    button_link: row.button_link,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
    sort_order: row.sort_order,
  }));
}

export async function getProducts(
  onlyActive = false,
  providerId: number | null = null
): Promise<ProductData[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_products WHERE ${where} ${active} AND ${PRODUCT_VISIBLE_SQL} ORDER BY sort_order ASC, id ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
    sort_order: row.sort_order,
  }));
}

export async function getFooter(providerId: number | null = null): Promise<FooterData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_footer WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    about_text: row.about_text,
    address: row.address,
    phone: row.phone,
    email: row.email,
    copyright: row.copyright,
    social_links: parseJson<SocialLink[]>(row.social_links, []),
  };
}

export async function getProductBySlug(
  slug: string,
  providerId: number | null = null
): Promise<ProductData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_products WHERE ${where} AND slug = ? AND is_active = 1 AND ${PRODUCT_VISIBLE_SQL} LIMIT 1`,
    [...params, slug]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
    sort_order: row.sort_order,
  };
}

export async function getSettings(): Promise<Record<string, string>> {
  const [rows] = await db.query<RowDataPacket[]>("SELECT `key`, `value` FROM cms_settings");
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function getAbout(providerId: number | null = null): Promise<AboutData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_about WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    subtitle: row.subtitle,
    content: row.content,
    image: row.image,
  };
}

export async function getContact(providerId: number | null = null): Promise<ContactData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_contact WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    title: row.title,
    subtitle: row.subtitle,
    address: row.address,
    phone: row.phone,
    email: row.email,
    whatsapp: row.whatsapp,
    hours: row.hours,
    lat: row.lat === null ? null : Number(row.lat),
    lng: row.lng === null ? null : Number(row.lng),
    map_url: row.map_url,
  };
}

export interface ProductStats {
  total: number;
  active: number;
  draft: number;
  totalStock: number;
  lowStock: number;
  outOfStock: number;
}

function mapProduct(row: RowDataPacket): ProductData {
  return {
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
    sort_order: row.sort_order,
  };
}

export async function getProductStats(providerId: number | null): Promise<ProductStats> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(is_active = 1), 0) AS active,
            COALESCE(SUM(is_active = 0), 0) AS draft,
            COALESCE(SUM(stock), 0) AS totalStock,
            COALESCE(SUM(stock > 0 AND stock <= 5), 0) AS lowStock,
            COALESCE(SUM(stock <= 0), 0) AS outOfStock
     FROM cms_products WHERE ${where}`,
    params
  );
  const r = rows[0];
  return {
    total: Number(r.total),
    active: Number(r.active),
    draft: Number(r.draft),
    totalStock: Number(r.totalStock),
    lowStock: Number(r.lowStock),
    outOfStock: Number(r.outOfStock),
  };
}

export async function getRecentProducts(
  providerId: number | null,
  limit = 5
): Promise<ProductData[]> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_products WHERE ${where} ORDER BY id DESC LIMIT ?`,
    [...params, limit]
  );
  return rows.map(mapProduct);
}

export async function getLowStockProducts(
  providerId: number | null,
  limit = 5
): Promise<ProductData[]> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_products WHERE ${where} AND stock > 0 AND stock <= 5 ORDER BY stock ASC LIMIT ?`,
    [...params, limit]
  );
  return rows.map(mapProduct);
}

export async function getCustomCode(providerId: number | null = null): Promise<CustomCodeData | null> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_custom_code WHERE ${where} LIMIT 1`,
    params
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    cdn_items: parseJson<CdnItem[]>(row.cdn_items, []),
    css: row.css,
    js_head: row.js_head,
    js_body: row.js_body,
  };
}

export interface PaginatedProducts {
  items: ProductData[];
  total: number;
  page: number;
  pages: number;
}

export async function getProductsPaginated(
  providerId: number | null,
  opts: {
    page?: number;
    limit?: number;
    q?: string;
    category?: string;
    brand?: string;
    min?: number;
    max?: number;
    includeHidden?: boolean;
  } = {}
): Promise<PaginatedProducts> {
  const limit = Math.min(Math.max(opts.limit ?? 24, 1), 100);
  const page = Math.max(opts.page ?? 1, 1);
  const offset = (page - 1) * limit;
  const q = (opts.q || "").trim();
  const category = (opts.category || "").trim();
  const brand = (opts.brand || "").trim();

  const conditions: string[] = [];
  const params: unknown[] = [];

  const [where, baseParams] = providerWhere(providerId);
  conditions.push(where);
  params.push(...baseParams);

  if (!opts.includeHidden) {
    conditions.push(PRODUCT_VISIBLE_SQL);
  }

  if (q) {
    conditions.push("(name LIKE ? OR category LIKE ? OR brand LIKE ?)");
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }
  if (brand) {
    conditions.push("brand = ?");
    params.push(brand);
  }
  if (opts.min !== undefined && !Number.isNaN(opts.min)) {
    conditions.push("price >= ?");
    params.push(opts.min);
  }
  if (opts.max !== undefined && !Number.isNaN(opts.max)) {
    conditions.push("price <= ?");
    params.push(opts.max);
  }

  const whereClause = conditions.join(" AND ");
  const [countRows] = await db.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM cms_products WHERE ${whereClause}`,
    params
  );
  const total = Number(countRows[0].total);

  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT * FROM cms_products WHERE ${whereClause} ORDER BY sort_order ASC, id ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const items = rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    slug: row.slug,
    sku: row.sku,
    description: row.description,
    price: row.price,
    image: row.image,
    category: row.category,
    brand: row.brand,
    stock: row.stock,
    is_active: row.is_active,
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
    sort_order: row.sort_order,
  }));

  return { items, total, page, pages: Math.max(Math.ceil(total / limit), 1) };
}

export async function getProductCategories(
  providerId: number | null,
  onlyActive = true
): Promise<string[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT DISTINCT category FROM cms_products WHERE ${where} ${active} AND category <> '' AND ${PRODUCT_VISIBLE_SQL} ORDER BY category ASC`,
    params
  );
  return rows.map((r) => r.category);
}

export async function getProductBrands(
  providerId: number | null,
  onlyActive = true
): Promise<string[]> {
  const [where, params] = providerWhere(providerId);
  const active = onlyActive ? "AND is_active = 1" : "";
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT DISTINCT brand FROM cms_products WHERE ${where} ${active} AND brand <> '' AND ${PRODUCT_VISIBLE_SQL} ORDER BY brand ASC`,
    params
  );
  return rows.map((r) => r.brand);
}

export interface CategorySummary {
  category: string;
  count: number;
  image: string;
}

export async function getTopCategories(
  providerId: number | null,
  limit = 8
): Promise<CategorySummary[]> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT category, COUNT(*) AS count,
            MAX(CASE WHEN image <> '' THEN image END) AS image
     FROM cms_products
     WHERE ${where} AND is_active = 1 AND category <> '' AND ${PRODUCT_VISIBLE_SQL}
     GROUP BY category
     ORDER BY count DESC, category ASC
     LIMIT ?`,
    [...params, limit]
  );
  return rows.map((r) => ({
    category: r.category,
    count: Number(r.count),
    image: r.image ?? "",
  }));
}

export async function getProviders(): Promise<ProviderData[]> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, slug, email, role, logo_image, is_active, created_at FROM cms_providers ORDER BY id ASC"
  );
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    role: row.role,
    logo_image: row.logo_image,
    is_active: row.is_active,
    created_at: row.created_at,
  }));
}

export async function getProviderBySlug(slug: string): Promise<ProviderData | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, slug, email, role, logo_image, is_active, created_at FROM cms_providers WHERE slug = ? AND is_active = 1 LIMIT 1",
    [slug]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    role: row.role,
    logo_image: row.logo_image,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export async function getProviderById(id: number): Promise<ProviderData | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, name, slug, email, role, logo_image, is_active, created_at FROM cms_providers WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    role: row.role,
    logo_image: row.logo_image,
    is_active: row.is_active,
    created_at: row.created_at,
  };
}

export interface ComponentData {
  id: number;
  provider_id: number | null;
  name: string;
  type: string;
  props: Record<string, unknown>;
  is_active: number;
  is_hidden: number;
}

export async function getComponents(providerId: number | null): Promise<ComponentData[]> {
  const [where, params] = providerWhere(providerId);
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT id, provider_id, name, type, props, is_active, is_hidden FROM cms_components WHERE ${where} ORDER BY id ASC`,
    params
  );
  return rows.map((row) => ({
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    type: row.type,
    props: parseJson<Record<string, unknown>>(row.props, {}),
    is_active: Number(row.is_active),
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
  }));
}

export async function getComponentById(id: number): Promise<ComponentData | null> {
  const [rows] = await db.query<RowDataPacket[]>(
    "SELECT id, provider_id, name, type, props, is_active, is_hidden FROM cms_components WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows.length) return null;
  const row = rows[0];
  return {
    id: row.id,
    provider_id: row.provider_id,
    name: row.name,
    type: row.type,
    props: parseJson<Record<string, unknown>>(row.props, {}),
    is_active: Number(row.is_active),
    is_hidden: row.is_hidden == null ? 0 : Number(row.is_hidden),
  };
}

function locationComponentsKey(providerId: number | null, location: string): string {
  return providerId === null ? `components_${location}` : `components_${location}_${providerId}`;
}

export async function getLocationComponentIds(
  providerId: number | null,
  location: string
): Promise<number[]> {
  const settings = await getSettings();
  const raw = settings[locationComponentsKey(providerId, location)];
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr)
      ? arr.map((n) => Number(n)).filter((n) => Number.isFinite(n) && n > 0)
      : [];
  } catch {
    return [];
  }
}

export async function getLocationComponents(
  providerId: number | null,
  location: string
): Promise<ComponentData[]> {
  const ids = await getLocationComponentIds(providerId, location);
  if (!ids.length) return [];
  const all = await getComponents(providerId);
  const byId = new Map(all.map((c) => [c.id, c]));
  return ids
    .map((id) => byId.get(id))
    .filter((c): c is ComponentData => !!c && c.is_active === 1 && c.is_hidden === 0);
}

export async function getHomeComponentIds(providerId: number | null): Promise<number[]> {
  return getLocationComponentIds(providerId, "home");
}

export async function getHomeComponents(providerId: number | null): Promise<ComponentData[]> {
  return getLocationComponents(providerId, "home");
}
