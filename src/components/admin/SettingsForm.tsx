"use client";

import { useState } from "react";
import Link from "next/link";
import ImagePicker from "./ImagePicker";
import { PRESETS, PRESET_NAMES, getSeasonTheme } from "@/lib/theme";

interface Props {
  initial: Record<string, string>;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const DEFAULT_KEYS = [
  "site_title",
  "site_description",
  "site_logo",
  "whatsapp",
  "currency",
  "store_page_size",
];

const THEME_KEYS = [
  "theme_color",
  "theme_primary",
  "theme_primary_light",
  "theme_primary_dark",
  "theme_primary_soft",
];

const CTA_KEYS = [
  "cta_enabled",
  "cta_badge",
  "cta_title",
  "cta_subtitle",
  "cta_button_text",
  "cta_button_link",
];

const MANAGED_SPECIAL_KEYS = [
  "active_theme",
  "components_home",
  ...THEME_KEYS,
  ...CTA_KEYS,
];

export default function SettingsForm({ initial }: Props) {
  const [form, setForm] = useState<Record<string, string>>({
    site_logo: "",
    ...initial,
  });
  const [newKey, setNewKey] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/settings", {
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

  function addKey() {
    const key = newKey.trim().toLowerCase().replace(/\s+/g, "_");
    if (!key || key in form) return;
    setForm((f) => ({ ...f, [key]: "" }));
    setNewKey("");
  }

  function setValue(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const presetName = form.theme_color || "blue";
  const preset = PRESETS[presetName] || PRESETS.blue;

  const colorFields: { key: string; label: string; fallback: string }[] = [
    { key: "theme_primary", label: "Principal", fallback: preset.primary },
    { key: "theme_primary_light", label: "Claro (hover)", fallback: preset.light },
    { key: "theme_primary_dark", label: "Oscuro", fallback: preset.dark },
    { key: "theme_primary_soft", label: "Fondo suave", fallback: preset.soft },
  ];

  const otherEntries = Object.entries(form).filter(
    ([key]) => !MANAGED_SPECIAL_KEYS.includes(key)
  );

  const activeSeason = getSeasonTheme(form.active_theme || "default");

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        {/* Banner de Temas de Temporada */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50/80 via-purple-50/70 to-pink-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3.5">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm text-2xl border border-gray-200/60">
              {activeSeason.emoji}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-900">
                  Tema: {activeSeason.name}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Activo
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Campañas temáticas exclusivas (Halloween 🎃, Navidad 🎄, San Valentín 💖).
              </p>
            </div>
          </div>
          <Link
            href="/admin/themes"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-bold bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl transition shadow-sm active:scale-95 shrink-0"
          >
            <span>Gestor de Temas</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <div>
          <h2 className="font-semibold text-gray-900">Colores del sitio</h2>
          <p className="text-sm text-gray-500">
            Cambia la paleta de colores. Los colores personalizados (opcionales) tienen
            prioridad sobre el preset.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Paleta</label>
            <select
              className={inputCls}
              value={presetName}
              onChange={(e) => setValue("theme_color", e.target.value)}
            >
              {PRESET_NAMES.map((name) => (
                <option key={name} value={name}>
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Vista previa</label>
            <div className="flex items-center gap-2 h-[42px]">
              <span
                className="w-10 h-10 rounded-xl"
                style={{ background: form.theme_primary || preset.primary }}
              />
              <span
                className="w-10 h-10 rounded-xl"
                style={{ background: form.theme_primary_light || preset.light }}
              />
              <span
                className="w-10 h-10 rounded-xl"
                style={{ background: form.theme_primary_dark || preset.dark }}
              />
              <span
                className="w-10 h-10 rounded-xl ring-1 ring-gray-200"
                style={{ background: form.theme_primary_soft || preset.soft }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {colorFields.map((f) => (
            <div key={f.key}>
              <label className={labelCls}>
                {f.label}{" "}
                <span className="text-gray-400 font-normal">(vacío usa el preset)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  className="h-10 w-14 rounded-lg border border-gray-200 bg-white cursor-pointer"
                  value={form[f.key] || f.fallback}
                  onChange={(e) => setValue(f.key, e.target.value)}
                />
                <input
                  className={inputCls}
                  value={form[f.key] || ""}
                  placeholder={f.fallback}
                  onChange={(e) => setValue(f.key, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Promocional CTA (Portada) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📣</span>
              <h2 className="font-semibold text-gray-900">Banner Promocional CTA (Portada)</h2>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Personaliza el banner de llamada a la acción que invita a los clientes a explorar todo el catálogo o promociones especiales.
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer shrink-0 select-none bg-gray-50 hover:bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-xl transition">
            <span className="text-xs font-semibold text-gray-700">
              {form.cta_enabled !== "0" ? "Activado" : "Oculto"}
            </span>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              checked={form.cta_enabled !== "0"}
              onChange={(e) => setValue("cta_enabled", e.target.checked ? "1" : "0")}
            />
          </label>
        </div>

        {/* Formulario de Campos */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                Etiqueta / Badge superior
                <span className="text-gray-400 font-normal ml-1">(opcional)</span>
              </label>
              <input
                className={inputCls}
                value={form.cta_badge ?? "⭐ Oferta Especial"}
                placeholder="⭐ Oferta Especial"
                onChange={(e) => setValue("cta_badge", e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Texto del Botón</label>
              <input
                className={inputCls}
                value={form.cta_button_text ?? "Ver toda la tienda"}
                placeholder="Ver toda la tienda"
                onChange={(e) => setValue("cta_button_text", e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Título principal</label>
            <input
              className={inputCls}
              value={form.cta_title ?? "¿Buscas algo más?"}
              placeholder="¿Buscas algo más?"
              onChange={(e) => setValue("cta_title", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Subtítulo / Mensaje descriptivo</label>
            <textarea
              rows={2}
              className={inputCls}
              value={
                form.cta_subtitle ??
                "Explora nuestro catálogo completo con los mejores precios y envíos a todo el país."
              }
              placeholder="Explora nuestro catálogo completo con los mejores precios y envíos a todo el país."
              onChange={(e) => setValue("cta_subtitle", e.target.value)}
            />
          </div>

          <div>
            <label className={labelCls}>Enlace / Destino del Botón (URL)</label>
            <input
              className={inputCls}
              value={form.cta_button_link ?? "/tienda"}
              placeholder="/tienda o https://..."
              onChange={(e) => setValue("cta_button_link", e.target.value)}
            />
          </div>
        </div>

        {/* Vista previa en vivo */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Vista previa en tiempo real
          </label>
          <div
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-950 via-gray-900 to-slate-900 p-6 text-white border border-gray-800 transition shadow-inner ${
              form.cta_enabled === "0" ? "opacity-50 grayscale" : ""
            }`}
          >
            {form.cta_enabled === "0" && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-[1px] flex items-center justify-center z-10">
                <span className="bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                  Banner Desactivado (Oculto en portada)
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="max-w-md">
                {(form.cta_badge || "⭐ Oferta Especial") && (
                  <span className="inline-block text-[11px] font-semibold bg-white/10 px-2.5 py-0.5 rounded-full mb-2 border border-white/10">
                    {form.cta_badge || "⭐ Oferta Especial"}
                  </span>
                )}
                <h3 className="text-xl font-extrabold tracking-tight">
                  {form.cta_title || "¿Buscas algo más?"}
                </h3>
                <p className="text-xs text-gray-300 mt-1 line-clamp-2">
                  {form.cta_subtitle ||
                    "Explora nuestro catálogo completo con los mejores precios y envíos a todo el país."}
                </p>
              </div>
              <div className="shrink-0 inline-flex items-center gap-1.5 bg-white text-gray-950 font-bold text-xs px-5 py-2.5 rounded-xl shadow self-start sm:self-auto pointer-events-none">
                <span>{form.cta_button_text || "Ver toda la tienda"}</span>
                <span>&rarr;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Ajustes generales</h2>
        {otherEntries.map(([key, value]) => {
          const isLogo = key === "site_logo";
          return (
            <div key={key}>
              <label className={labelCls}>
                {key}
                {isLogo && (
                  <span className="text-gray-400 font-normal"> · logo del sistema</span>
                )}
              </label>
              {isLogo ? (
                <ImagePicker value={value} onChange={(url) => setValue(key, url)} />
              ) : (
                <input
                  className={inputCls}
                  value={value}
                  onChange={(e) => setValue(key, e.target.value)}
                />
              )}
              {isLogo && (
                <p className="text-xs text-gray-400 mt-1">
                  Recomendado: PNG o SVG · 200×60 px (horizontal) o 512×512 px (cuadrado).
                </p>
              )}
            </div>
          );
        })}
        <div className="flex gap-2 pt-2">
          <input
            className={inputCls}
            placeholder="nueva_clave"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
          />
          <button
            type="button"
            onClick={addKey}
            className="shrink-0 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm hover:bg-gray-700"
          >
            + Añadir
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Claves por defecto usadas por el sitio: {DEFAULT_KEYS.join(", ")}.
        </p>
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
