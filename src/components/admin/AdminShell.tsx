"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import FeedbackHost from "./feedback";

type IconName =
  | "panel"
  | "header"
  | "banners"
  | "store"
  | "footer"
  | "code"
  | "info"
  | "map"
  | "pages"
  | "categories"
  | "components"
  | "providers"
  | "endpoint"
  | "settings"
  | "external"
  | "logout"
  | "menu"
  | "close"
  | "docs";

const ICON_PATHS: Record<IconName, string> = {
  panel:
    "M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z",
  header: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  banners:
    "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z",
  store:
    "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z",
  footer:
    "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z",
  code: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  info: "M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z",
  pages: "M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9",
  categories:
    "M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z",
  components:
    "M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122",
  map: "M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934a1.12 1.12 0 01-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934a1.12 1.12 0 011.006 0l4.994 2.497c.317.158.69.158 1.006 0z",
  providers:
    "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  endpoint: "M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5",
  settings:
    "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
  external:
    "M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25",
  logout:
    "M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9",
  menu: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5",
  close: "M6 18L18 6M6 6l12 12",
  docs: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "w-5 h-5"}
      aria-hidden="true"
    >
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

interface NavItem {
  href: string;
  label: string;
  icon: IconName;
  children?: NavItem[];
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const superGroups: NavGroup[] = [
  {
    label: "Contenido",
    items: [
      { href: "/admin", label: "Panel", icon: "panel" },
      {
        href: "/admin/header",
        label: "Header",
        icon: "header",
        children: [{ href: "/admin/menus", label: "Menús", icon: "menu" }],
      },
      { href: "/admin/banners", label: "Banners", icon: "banners" },
      {
        href: "/admin/store",
        label: "Tienda",
        icon: "store",
        children: [
          { href: "/admin/store", label: "Productos", icon: "store" },
          { href: "/admin/categories", label: "Categorías", icon: "categories" },
        ],
      },
      { href: "/admin/footer", label: "Footer", icon: "footer" },
      { href: "/admin/about", label: "Nosotros", icon: "info" },
      { href: "/admin/contact", label: "Contacto", icon: "map" },
      { href: "/admin/pages", label: "Páginas", icon: "pages" },
      { href: "/admin/components", label: "Componentes", icon: "components" },
      { href: "/admin/code", label: "Código", icon: "code" },
      { href: "/admin/docs", label: "Documentación", icon: "docs" },
    ],
  },
  {
    label: "Administración",
    items: [
      { href: "/admin/providers", label: "Proveedores", icon: "providers" },
      { href: "/admin/endpoint", label: "Endpoint", icon: "endpoint" },
      { href: "/admin/settings", label: "Ajustes", icon: "settings" },
    ],
  },
];

const providerGroups: NavGroup[] = [
  {
    label: "Mi sitio",
    items: [
      { href: "/admin", label: "Panel", icon: "panel" },
      {
        href: "/admin/header",
        label: "Header",
        icon: "header",
        children: [{ href: "/admin/menus", label: "Menús", icon: "menu" }],
      },
      { href: "/admin/banners", label: "Banners", icon: "banners" },
      {
        href: "/admin/store",
        label: "Tienda",
        icon: "store",
        children: [
          { href: "/admin/store", label: "Productos", icon: "store" },
          { href: "/admin/categories", label: "Categorías", icon: "categories" },
        ],
      },
      { href: "/admin/footer", label: "Footer", icon: "footer" },
      { href: "/admin/about", label: "Nosotros", icon: "info" },
      { href: "/admin/contact", label: "Contacto", icon: "map" },
      { href: "/admin/pages", label: "Páginas", icon: "pages" },
      { href: "/admin/components", label: "Componentes", icon: "components" },
      { href: "/admin/code", label: "Código", icon: "code" },
      { href: "/admin/docs", label: "Documentación", icon: "docs" },
    ],
  },
];

interface Props {
  role: "superadmin" | "provider";
  providerName?: string;
  providerSlug?: string;
  logo?: string;
  children: React.ReactNode;
}

function SidebarItem({
  item,
  onNavigate,
  collapsed,
}: {
  item: NavItem;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const children = item.children ?? [];
  const hasChildren = children.length > 0;
  const active = pathname === item.href;
  const childActive = children.some((c) => pathname === c.href);
  const [open, setOpen] = useState(childActive);
  const expanded = open || childActive;

  if (collapsed) {
    const isActive = active || childActive;
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        title={item.label}
        className={`relative flex items-center justify-center p-2.5 rounded-xl transition-all ${
          isActive
            ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-900/40"
            : "text-gray-400 hover:bg-white/5 hover:text-white"
        }`}
      >
        {isActive && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/90" />
        )}
        <Icon name={item.icon} className="w-5 h-5 shrink-0" />
      </Link>
    );
  }

  const cls = (isActive: boolean) =>
    `group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-lg shadow-blue-900/40"
        : "text-gray-400 hover:bg-white/5 hover:text-white"
    }`;

  if (!hasChildren) {
    return (
      <Link href={item.href} onClick={onNavigate} className={cls(active)}>
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/90" />
        )}
        <Icon name={item.icon} className="w-5 h-5 shrink-0" />
        {item.label}
        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />}
      </Link>
    );
  }

  const isParentActive = active || childActive;

  return (
    <div>
      <div className="flex items-center">
        <Link
          href={item.href}
          onClick={onNavigate}
          className={`${cls(isParentActive)} flex-1 min-w-0`}
        >
          {isParentActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-white/90" />
          )}
          <Icon name={item.icon} className="w-5 h-5 shrink-0" />
          {item.label}
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={expanded}
          aria-label={expanded ? "Contraer submenú" : "Expandir submenú"}
          className={`shrink-0 w-7 h-7 mr-2 rounded-lg flex items-center justify-center transition-colors ${
            isParentActive ? "text-white hover:bg-white/15" : "text-gray-500 hover:bg-white/10 hover:text-white"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-200 ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <div className="ml-4 mt-1 mb-1 space-y-1 border-l border-white/10 pl-2">
            {children.map((c) => (
              <SidebarItem key={c.href} item={c} onNavigate={onNavigate} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminShell({ role, providerName, providerSlug, logo, children }: Props) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const groups = role === "superadmin" ? superGroups : providerGroups;
  const sitePath = role === "provider" && providerSlug ? `/p/${providerSlug}` : "/";
  const displayName = role === "superadmin" ? "Administrador" : providerName ?? "Proveedor";
  const roleLabel = role === "superadmin" ? "Superadmin" : "Proveedor";

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className={`px-5 pt-5 pb-4 ${collapsed ? "flex justify-center" : ""}`}>
        {collapsed ? (
          <button
            onClick={() => setCollapsed(false)}
            title="Expandir menú"
            className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/40 hover:scale-105 transition overflow-hidden"
          >
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              "C"
            )}
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-gray-950" />
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-3 flex-1 min-w-0">
              <span className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 via-sky-500 to-sky-500 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/40 overflow-hidden">
                {logo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  "C"
                )}
                <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-gray-950" />
              </span>
              <div className="leading-tight min-w-0">
                <p className="text-white font-semibold tracking-tight truncate">CMS Admin</p>
                <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-blue-300 mt-0.5">
                  {roleLabel}
                </span>
              </div>
            </Link>
            <button
              onClick={() => setCollapsed(true)}
              title="Contraer menú"
              className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4 h-4"
                aria-hidden="true"
              >
                <path d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-6">
        {groups.map((group) => (
          <div key={group.label}>
            {collapsed ? (
              <div className="mx-2 mb-3 border-t border-white/10" />
            ) : (
              <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-600">
                {group.label}
              </p>
            )}
            <div className="space-y-1">
              {group.items.map((item) => (
                <SidebarItem
                  key={item.href}
                  item={item}
                  onNavigate={() => setMobileOpen(false)}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <span
              title={displayName}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold"
            >
              {displayName.charAt(0).toUpperCase()}
            </span>
            <button
              onClick={logout}
              title="Cerrar sesión"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <Icon name="logout" className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <>
            <div className="rounded-2xl bg-white/5 p-3 flex items-center gap-3">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
                {displayName.charAt(0).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white truncate">{displayName}</p>
                <p className="text-[11px] text-gray-500 truncate">{roleLabel}</p>
              </div>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon name="logout" className="w-5 h-5" />
              </button>
            </div>
            <Link
              href={sitePath}
              target="_blank"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <Icon name="external" className="w-5 h-5 shrink-0" />
              Ver {role === "provider" ? "mi sitio" : "sitio"}
            </Link>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside
        className={`hidden lg:flex ${
          collapsed ? "w-20" : "w-64"
        } shrink-0 sticky top-0 h-screen bg-gray-950 text-gray-400 transition-[width] duration-200`}
      >
        {sidebar}
      </aside>

      {/* Sidebar móvil */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-72 bg-gray-950 text-gray-400 shadow-2xl">
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* Top bar móvil */}
        <div className="lg:hidden sticky top-0 z-30 flex items-center gap-3 bg-gray-950 text-white px-4 h-14">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-white/10"
            aria-label="Abrir menú"
          >
            <Icon name="menu" className="w-5 h-5" />
          </button>
          <span className="font-semibold">CMS Admin</span>
        </div>

        <main className="p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {role === "provider" && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {providerName?.charAt(0) ?? "P"}
              </span>
              <div>
                <p className="font-semibold text-blue-900">{providerName}</p>
                <p className="text-sm text-blue-700">
                  Estás editando tu propio sitio:{" "}
                  <a
                    href={`/p/${providerSlug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    /p/{providerSlug}
                  </a>
                </p>
              </div>
            </div>
          )}
          {children}
        </main>
      </div>
      <FeedbackHost />
    </div>
  );
}
