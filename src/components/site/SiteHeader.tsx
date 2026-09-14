"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import type { HeaderData, MenuItem } from "@/lib/data";

interface Props {
  header: HeaderData;
  fallbackLogo?: string;
  basePath?: string;
}

function resolveHref(href: string, basePath?: string): string {
  if (!basePath) return href;
  if (href === "/") return basePath;
  if (href.startsWith("/") && !href.startsWith(basePath) && !href.startsWith("//")) {
    return basePath + href;
  }
  return href;
}

function isActive(
  href: string,
  basePath: string | undefined,
  homeHref: string,
  pathname: string
): boolean {
  const target = resolveHref(href || "#", basePath);
  if (!target.startsWith("/")) return pathname === target;
  if (target === homeHref) return pathname === homeHref;
  return pathname === target || pathname.startsWith(target + "/");
}

function itemIsActive(
  item: MenuItem,
  basePath: string | undefined,
  homeHref: string,
  pathname: string
): boolean {
  if (isActive(item.href || "#", basePath, homeHref, pathname)) return true;
  return item.children.some((c) => itemIsActive(c, basePath, homeHref, pathname));
}

const SOCIAL_PATHS: Record<string, string> = {
  facebook:
    "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  instagram:
    "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  x: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  youtube:
    "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  whatsapp:
    "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  tiktok:
    "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z",
  linkedin:
    "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
};

function socialKey(label: string): string | null {
  const n = label.trim().toLowerCase();
  if (!n) return null;
  if (n.includes("facebook") || n === "fb") return "facebook";
  if (n.includes("instagram") || n === "ig") return "instagram";
  if (n.includes("tiktok")) return "tiktok";
  if (n.includes("whatsapp") || n === "wsp" || n === "wa") return "whatsapp";
  if (n.includes("youtube") || n === "yt") return "youtube";
  if (n.includes("linkedin")) return "linkedin";
  if (n === "x" || n.includes("twitter")) return "x";
  return null;
}

function SocialIcon({ label, className }: { label: string; className?: string }) {
  const key = socialKey(label);
  if (!key) return <span className={className}>{label}</span>;
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d={SOCIAL_PATHS[key]} />
    </svg>
  );
}

const PHONE_PATH =
  "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z";

const MAIL_PATH =
  "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75";

const CHEVRON_DOWN =
  "M19.5 8.25l-7.5 7.5-7.5-7.5";
const CHEVRON_RIGHT = "M8.25 4.5l7.5 7.5-7.5 7.5";

interface NavCtx {
  basePath?: string;
  homeHref: string;
  pathname: string;
}

function SubMenuItems({
  items,
  depth,
  ctx,
}: {
  items: MenuItem[];
  depth: number;
  ctx: NavCtx;
}) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = item.children.length > 0;
        const href = resolveHref(item.href || "#", ctx.basePath);
        const active = itemIsActive(item, ctx.basePath, ctx.homeHref, ctx.pathname);
        const posClass =
          depth === 0 ? "left-0 top-full pt-2" : "left-full top-0 -mt-2 pl-2";

        if (!hasChildren) {
          return (
            <Link
              key={item.id}
              href={href}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                active ? "bg-primary-soft text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <div key={item.id} className="relative group/menu">
            <button
              type="button"
              className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm transition-colors ${
                active ? "bg-primary-soft text-primary" : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.label}</span>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5 opacity-50"
                aria-hidden="true"
              >
                <path d={depth === 0 ? CHEVRON_DOWN : CHEVRON_RIGHT} />
              </svg>
            </button>
            <div
              className={`absolute ${posClass} min-w-[220px] opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible focus-within:opacity-100 focus-within:visible transition-all duration-150 z-50`}
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2">
                <SubMenuItems items={item.children} depth={depth + 1} ctx={ctx} />
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

function TopNavItem({ item, ctx }: { item: MenuItem; ctx: NavCtx }) {
  const hasChildren = item.children.length > 0;
  const active = itemIsActive(item, ctx.basePath, ctx.homeHref, ctx.pathname);

  if (!hasChildren) {
    return (
      <Link
        href={resolveHref(item.href || "#", ctx.basePath)}
        className={`group relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active ? "text-primary" : "text-gray-700 hover:text-gray-900"
        }`}
      >
        {item.label}
        <span
          className={`absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary-light to-primary transition-transform duration-300 ease-out origin-left ${
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </Link>
    );
  }

  return (
    <div className="relative group/top">
      <button
        type="button"
        className={`group relative inline-flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          active ? "text-primary" : "text-gray-700 hover:text-gray-900"
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3.5 h-3.5 opacity-60 transition-transform duration-200 group-hover:rotate-180"
          aria-hidden="true"
        >
          <path d={CHEVRON_DOWN} />
        </svg>
        <span
          className={`absolute inset-x-4 bottom-1 h-0.5 rounded-full bg-gradient-to-r from-primary-light to-primary transition-transform duration-300 ease-out origin-left ${
            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
          }`}
        />
      </button>
      <div className="absolute left-0 top-full pt-2 opacity-0 invisible group-hover/top:opacity-100 group-hover/top:visible focus-within:opacity-100 focus-within:visible transition-all duration-150 z-50">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 py-2 min-w-[220px]">
          <SubMenuItems items={item.children} depth={1} ctx={ctx} />
        </div>
      </div>
    </div>
  );
}

function MobileNavItem({ item, ctx }: { item: MenuItem; ctx: NavCtx }) {
  const [open, setOpen] = useState(false);
  const hasChildren = item.children.length > 0;
  const active = itemIsActive(item, ctx.basePath, ctx.homeHref, ctx.pathname);

  if (!hasChildren) {
    return (
      <Link
        href={resolveHref(item.href || "#", ctx.basePath)}
        className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
          active ? "bg-primary-soft text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
          active ? "bg-primary-soft text-primary" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        {item.label}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d={CHEVRON_DOWN} />
        </svg>
      </button>
      {open && (
        <div className="ml-3 mt-1 space-y-1 border-l border-gray-200 pl-3">
          {item.children.map((child) => (
            <MobileNavItem key={child.id} item={child} ctx={ctx} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SiteHeader({ header, fallbackLogo, basePath }: Props) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const logo = header.logo_image || fallbackLogo || "";
  const homeHref = basePath || "/";
  const storeHref = resolveHref("/tienda", basePath);
  const menu = header.menu ?? [];
  const ctx: NavCtx = { basePath, homeHref, pathname };

  const showTopbar = header.show_topbar !== 0;
  const showStoreButton = header.show_store_button !== 0;

  return (
    <header className={header.sticky !== 0 ? "sticky top-0 z-40" : "relative z-40"}>
      {/* Barra superior (contacto y redes) */}
      {showTopbar && (
        <div className="hidden md:block bg-gray-950 text-gray-400 text-sm">
          <div className="container-site flex items-center justify-between h-9">
            <div className="flex items-center gap-5">
              {header.phone && (
                <a
                  href={`tel:${header.phone}`}
                  className="group flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  >
                    <path d={PHONE_PATH} />
                  </svg>
                  {header.phone}
                </a>
              )}
              {header.email && (
                <a
                  href={`mailto:${header.email}`}
                  className="group flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity"
                    aria-hidden="true"
                  >
                    <path d={MAIL_PATH} />
                  </svg>
                  {header.email}
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              {header.social_links.map((s, i) => (
                <a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  title={s.label}
                  className="flex items-center gap-1.5 hover:text-white hover:-translate-y-0.5 transition-all duration-200"
                >
                  <SocialIcon label={s.label} className="w-3.5 h-3.5" />
                  <span className="hidden lg:inline">{s.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navegación principal */}
      <div
        className={`bg-white/80 backdrop-blur-xl border-b transition-all duration-300 ${
          scrolled
            ? "border-gray-200 shadow-md shadow-gray-900/10 bg-white/90"
            : "border-gray-200/70 shadow-sm shadow-gray-900/5"
        }`}
      >
        <div className="container-site flex items-center justify-between h-16">
          <Link href={homeHref} className="flex items-center gap-2.5 group">
            {logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logo}
                alt={header.site_name}
                className="h-10 w-10 rounded-xl object-cover ring-1 ring-gray-200 group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <span className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-light to-primary text-white flex items-center justify-center font-bold shadow-lg shadow-primary-light/25 group-hover:scale-105 transition-transform duration-300">
                {(header.logo_text || header.site_name).charAt(0).toUpperCase()}
              </span>
            )}
            <span className="text-lg font-bold text-gray-900 tracking-tight group-hover:text-primary transition-colors">
              {header.logo_text || header.site_name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {menu.map((item) => (
              <TopNavItem key={item.id} item={item} ctx={ctx} />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {showStoreButton && (
              <Link
                href={storeHref}
                className="group hidden sm:inline-flex items-center gap-2 bg-gray-900 text-white text-sm font-semibold rounded-full px-5 py-2.5 hover:bg-primary hover:shadow-lg hover:shadow-primary-light/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                Ver tienda
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <path d="M13.5 4.5L21 12l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            )}

            <button
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={open}
              className="md:hidden relative w-10 h-10 rounded-xl flex flex-col items-center justify-center gap-[5px] text-gray-900 hover:bg-gray-100 active:scale-95 transition-all"
            >
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  open ? "translate-y-[7px] rotate-45" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  open ? "opacity-0" : ""
                }`}
              />
              <span
                className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
                  open ? "-translate-y-[7px] -rotate-45" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Menú móvil */}
        <div
          className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
            open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="px-4 pt-2 pb-5 border-t border-gray-100 bg-white/80 backdrop-blur-xl">
              <nav className="space-y-1">
                {menu.map((item) => (
                  <MobileNavItem key={item.id} item={item} ctx={ctx} />
                ))}
              </nav>

              {showStoreButton && (
                <Link
                  href={storeHref}
                  onClick={() => setOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 bg-gray-900 text-white text-sm font-semibold rounded-xl px-5 py-3 hover:bg-primary transition-colors"
                >
                  Ver tienda
                </Link>
              )}

              {(header.phone || header.email) && (
                <div className="mt-4 flex flex-col gap-2 text-sm text-gray-600">
                  {header.phone && (
                    <a href={`tel:${header.phone}`} className="flex items-center gap-2 hover:text-gray-900">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d={PHONE_PATH} />
                      </svg>
                      {header.phone}
                    </a>
                  )}
                  {header.email && (
                    <a href={`mailto:${header.email}`} className="flex items-center gap-2 hover:text-gray-900">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                        aria-hidden="true"
                      >
                        <path d={MAIL_PATH} />
                      </svg>
                      {header.email}
                    </a>
                  )}
                </div>
              )}

              {header.social_links.length > 0 && (
                <div className="mt-4 flex items-center gap-3">
                  {header.social_links.map((s, i) => (
                    <a
                      key={i}
                      href={s.url || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      title={s.label}
                      className="w-9 h-9 rounded-lg bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                    >
                      <SocialIcon label={s.label} className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
