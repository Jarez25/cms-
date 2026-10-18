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
  getSettings,
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
    <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center justify-between">
        <span className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center text-sm font-bold text-white shadow-xs`}>
          {typeof value === "number" && value > 999 ? "999+" : value}
        </span>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-1">{label}</p>
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

  const [header, banners, categories, pages, stats, recent, lowStock, settings] = await Promise.all([
    getHeader(providerId),
    getBanners(false, providerId),
    getCategories(providerId),
    getPages(providerId),
    getProductStats(providerId),
    getRecentProducts(providerId, 5),
    getLowStockProducts(providerId, 5),
    getSettings(),
  ]);

  let providersCount = 0;
  if (isSuper) {
    providersCount = (await getProviders()).length;
  }

  const currency = settings.currency || "S/. ";
  const totalStock = stats.totalStock;
  const siteUrl = isSuper ? "/" : `/p/${provider?.slug ?? ""}`;

  return (
    <div className="space-y-8">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700">
              {isSuper ? "Super Administrador" : "Proveedor"}
            </span>
            {provider?.slug && (
              <span className="text-xs text-gray-400 font-mono">/p/{provider.slug}</span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight mt-1.5">
            {isSuper ? "Panel de Control" : `Bienvenido, ${provider?.name ?? "Proveedor"}`}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {header?.site_name ? `Sitio activo: ${header.site_name}` : "Gestiona tu contenido, productos y catálogo."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={siteUrl}
            target="_blank"
            className="inline-flex items-center gap-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 transition active:scale-95 shadow-sm"
          >
            <span>Ver mi sitio</span>
            <span className="text-xs">↗</span>
          </Link>
        </div>
      </div>

      {/* Tarjetas de Estadísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total Productos" value={stats.total} href="/admin/store" accent="bg-blue-600" />
        <StatCard label="Publicados" value={stats.active} href="/admin/store" accent="bg-emerald-600" />
        <StatCard label="Borradores" value={stats.draft} href="/admin/store" accent="bg-amber-500" />
        <StatCard label="Stock Total (uds)" value={totalStock} accent="bg-cyan-600" />
        <StatCard label="Stock Bajo (≤5)" value={stats.lowStock} accent="bg-orange-500" />
        <StatCard label="Sin Stock" value={stats.outOfStock} accent="bg-rose-600" />
        <StatCard label="Categorías" value={categories.length} href="/admin/categories" accent="bg-indigo-600" />
        <StatCard label="Páginas" value={pages.length} href="/admin/pages" accent="bg-purple-600" />
        <StatCard label="Banners" value={banners.length} href="/admin/banners" accent="bg-slate-700" />
        {isSuper && (
          <StatCard label="Proveedores" value={providersCount} href="/admin/providers" accent="bg-teal-600" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Productos Recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 text-sm">Productos Añadidos Recientemente</h2>
            <Link href="/admin/store" className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition">
              Ver todos →
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-400 text-sm px-5 py-10 text-center">Aún no hay productos registrados.</p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {recent.map((p) => (
                <li key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200/60 flex items-center justify-center">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[10px] text-gray-400">Sin foto</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.sku ? `SKU: ${p.sku} · ` : ""}
                      {p.category || "General"}
                    </p>
                  </div>
                  <span suppressHydrationWarning className="text-sm font-bold text-gray-900">
                    {formatPrice(p.price, currency)}
                  </span>
                  <span
                    className={`text-[11px] font-semibold rounded-full px-2.5 py-0.5 ${
                      p.is_active ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {p.is_active ? "Activo" : "Borrador"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Columna Derecha: Stock Crítico + Accesos Rápidos */}
        <div className="space-y-6">
          {/* Alertas de Stock */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Alertas de Inventario</h2>
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            </div>
            {lowStock.length === 0 ? (
              <p className="text-emerald-600 text-xs font-medium px-5 py-6 text-center">
                ✓ Todo el inventario está en niveles óptimos.
              </p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {lowStock.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-gray-50/50 transition">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.sku ? `SKU ${p.sku}` : "Sin SKU"}</p>
                    </div>
                    <span className="text-xs font-bold rounded-full px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200">
                      {p.stock} uds
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accesos Rápidos */}
          <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-5">
            <h2 className="font-bold text-gray-900 text-sm mb-3">Acciones Frecuentes</h2>
            <div className="space-y-2 text-sm font-medium">
              <Link
                href="/admin/store"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition"
              >
                <span>＋ Administrar Productos</span>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                href="/admin/banners"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition"
              >
                <span>＋ Configurar Banners</span>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                href="/admin/pages"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition"
              >
                <span>＋ Crear Nueva Página</span>
                <span className="text-gray-400">→</span>
              </Link>
              <Link
                href="/admin/media"
                className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 transition"
              >
                <span>📁 Subir Multimedia</span>
                <span className="text-gray-400">→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
