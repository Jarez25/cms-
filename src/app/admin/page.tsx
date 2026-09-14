import Link from "next/link";
import { getSession } from "@/lib/auth";
import {
  getBanners,
  getCategories,
  getHeader,
  getLowStockProducts,
  getPages,
  getProductStats,
  getProviderById,
  getProviders,
  getRecentProducts,
} from "@/lib/data";
import { formatPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string | number;
  href?: string;
  accent: string;
}) {
  const body = (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center text-sm font-bold text-white`}>
          {value}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session) return null;

  const providerId = session.providerId;
  const provider =
    session.role === "provider" && providerId ? await getProviderById(providerId) : null;
  const isSuper = session.role === "superadmin";

  const [header, banners, categories, pages, stats, recent, lowStock] = await Promise.all([
    getHeader(providerId),
    getBanners(false, providerId),
    getCategories(providerId),
    getPages(providerId),
    getProductStats(providerId),
    getRecentProducts(providerId, 5),
    getLowStockProducts(providerId, 5),
  ]);

  let providersCount = 0;
  if (isSuper) {
    providersCount = (await getProviders()).length;
  }

  const currency = "";
  const totalStock = stats.totalStock;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isSuper ? "Panel de administración" : `Hola, ${provider?.name ?? "proveedor"}`}
        </h1>
        <p className="text-gray-500 mt-1">
          {isSuper
            ? "Resumen general de tu sitio y proveedores."
            : "Resumen de tu tienda."}{" "}
          <span className="font-medium text-gray-700">{header?.site_name}</span>
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Productos" value={stats.total} href="/admin/store" accent="bg-blue-600" />
        <StatCard label="Publicados" value={stats.active} href="/admin/store" accent="bg-emerald-600" />
        <StatCard label="Borradores" value={stats.draft} href="/admin/store" accent="bg-amber-500" />
        <StatCard label="Unidades en stock" value={totalStock} accent="bg-cyan-600" />
        <StatCard label="Stock bajo (≤5)" value={stats.lowStock} accent="bg-orange-500" />
        <StatCard label="Sin stock" value={stats.outOfStock} accent="bg-rose-600" />
        <StatCard label="Categorías" value={categories.length} href="/admin/categories" accent="bg-sky-600" />
        <StatCard label="Páginas" value={pages.length} href="/admin/pages" accent="bg-sky-600" />
        <StatCard label="Banners" value={banners.length} href="/admin/banners" accent="bg-slate-600" />
        {isSuper && (
          <StatCard label="Proveedores" value={providersCount} href="/admin/providers" accent="bg-blue-600" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900">Productos recientes</h2>
            <Link href="/admin/store" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Ver todos →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm px-5 py-8 text-center">Sin productos todavía.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt="" className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.sku ? `SKU ${p.sku} · ` : ""}
                      {p.category || "Sin categoría"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatPrice(p.price, currency || "")}
                  </span>
                  <span
                    className={`text-xs font-medium rounded-full px-2 py-0.5 ${
                      p.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.is_active ? "Publicado" : "Borrador"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Stock bajo + acciones */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Stock bajo</h2>
            </div>
            {lowStock.length === 0 ? (
              <p className="text-gray-400 text-sm px-5 py-6 text-center">
                No hay productos con stock bajo. 👍
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sku ? `SKU ${p.sku}` : "—"}</p>
                    </div>
                    <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-orange-100 text-orange-700">
                      {p.stock} uds
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">Acciones rápidas</h2>
            <div className="space-y-2">
              <Link href="/admin/store" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                + Nuevo producto <span>→</span>
              </Link>
              <Link href="/admin/categories" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                + Nueva categoría <span>→</span>
              </Link>
              <Link href="/admin/pages" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                + Nueva página <span>→</span>
              </Link>
              <Link href="/admin/banners" className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors">
                + Nuevo banner <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
