"use client";

import { useState } from "react";
import ImagePicker from "./ImagePicker";

interface NavItem {
  label: string;
  href: string;
}

interface SocialLink {
  label: string;
  url: string;
}

interface MenuOption {
  id: number;
  name: string;
  is_active: number;
}

interface Props {
  initial: {
    site_name: string;
    logo_text: string;
    logo_image: string;
    favicon: string;
    phone: string;
    email: string;
    menu_id: number | null;
    show_topbar: number;
    show_store_button: number;
    sticky: number;
    nav_items: NavItem[];
    social_links: SocialLink[];
  };
  menus: MenuOption[];
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const cardCls = "bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4";

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 w-4 h-4 rounded accent-blue-600"
      />
      <span>
        <span className="block text-sm font-medium text-gray-700">{label}</span>
        {hint && <span className="block text-xs text-gray-400">{hint}</span>}
      </span>
    </label>
  );
}

export default function HeaderForm({ initial, menus }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function setListItem(list: SocialLink[], i: number, key: "label" | "url", value: string) {
    set(
      "social_links",
      list.map((item, idx) => (idx === i ? { ...item, [key]: value } : item))
    );
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/header", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) window.dispatchEvent(new Event("cms:reload-preview"));
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  return (
    <form onSubmit={save} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className={cardCls}>
        <h2 className="font-semibold text-gray-900">Identidad y marca</h2>
        <div>
          <label className={labelCls}>Nombre del sitio</label>
          <input
            className={inputCls}
            value={form.site_name}
            onChange={(e) => set("site_name", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Texto del logo</label>
          <input
            className={inputCls}
            value={form.logo_text}
            onChange={(e) => set("logo_text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Logo (imagen)</label>
            <ImagePicker value={form.logo_image} onChange={(url) => set("logo_image", url)} />
            <p className="text-xs text-gray-400 mt-1">
              Recomendado: PNG o SVG · 200×60 px (horizontal) o 512×512 px (cuadrado).
            </p>
          </div>
          <div>
            <label className={labelCls}>Favicon (icono del navegador)</label>
            <ImagePicker value={form.favicon} onChange={(url) => set("favicon", url)} />
            <p className="text-xs text-gray-400 mt-1">
              Recomendado: PNG, ICO o SVG · 32×32 px o 512×512 px.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              className={inputCls}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className={cardCls}>
        <h2 className="font-semibold text-gray-900">Menú y personalización</h2>
        <div>
          <label className={labelCls}>Menú del header</label>
          <select
            className={inputCls}
            value={form.menu_id == null ? "" : String(form.menu_id)}
            onChange={(e) =>
              set("menu_id", e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">Sin menú</option>
            {menus.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
                {m.is_active ? "" : " (inactivo)"}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Crea y administra menús en{" "}
            <a href="/admin/menus" className="text-blue-600 hover:text-blue-800 underline">
              Menús
            </a>
            . Si eliges uno inactivo, no se mostrará.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <Toggle
            label="Barra superior"
            hint="Teléfono, email y redes sociales"
            checked={form.show_topbar === 1}
            onChange={(v) => set("show_topbar", v ? 1 : 0)}
          />
          <Toggle
            label="Botón 'Ver tienda'"
            hint="Botón destacado en el header"
            checked={form.show_store_button === 1}
            onChange={(v) => set("show_store_button", v ? 1 : 0)}
          />
          <Toggle
            label="Header fijo (sticky)"
            hint="Permanece visible al hacer scroll"
            checked={form.sticky === 1}
            onChange={(v) => set("sticky", v ? 1 : 0)}
          />
        </div>
      </div>
      </div>

      <div className={cardCls + " space-y-3"}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Redes sociales</h2>
          <button
            type="button"
            onClick={() => set("social_links", [...form.social_links, { label: "", url: "" }])}
            className="text-sm bg-gray-900 text-white rounded-xl px-3 py-1.5 hover:bg-gray-700"
          >
            + Añadir red
          </button>
        </div>
        {form.social_links.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              className={inputCls}
              placeholder="Nombre (Facebook)"
              value={item.label}
              onChange={(e) => setListItem(form.social_links, i, "label", e.target.value)}
            />
            <input
              className={inputCls}
              placeholder="https://..."
              value={item.url}
              onChange={(e) => setListItem(form.social_links, i, "url", e.target.value)}
            />
            <button
              type="button"
              onClick={() => set("social_links", form.social_links.filter((_, idx) => idx !== i))}
              className="shrink-0 text-red-600 hover:text-red-800 px-2 py-2"
              aria-label="Eliminar red"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-6 py-2.5 font-medium hover:from-blue-500 hover:to-sky-500 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando..." : "Guardar cambios"}
        </button>
        {status === "saved" && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {status === "error" && <span className="text-red-600 text-sm">Error al guardar</span>}
      </div>
    </form>
  );
}
