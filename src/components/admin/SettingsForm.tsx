"use client";

import { useState } from "react";
import ImagePicker from "./ImagePicker";
import { PRESETS, PRESET_NAMES } from "@/lib/theme";

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
  "favicon",
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

export default function SettingsForm({ initial }: Props) {
  const [form, setForm] = useState<Record<string, string>>({
    site_logo: "",
    favicon: "",
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
    ([key]) => !THEME_KEYS.includes(key)
  );

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Ajustes generales</h2>
        {otherEntries.map(([key, value]) => {
          const isLogo = key === "site_logo";
          const isFavicon = key === "favicon";
          return (
            <div key={key}>
              <label className={labelCls}>
                {key}
                {isLogo && (
                  <span className="text-gray-400 font-normal"> · logo del sistema</span>
                )}
                {isFavicon && (
                  <span className="text-gray-400 font-normal"> · icono del navegador del sitio</span>
                )}
              </label>
              {isLogo || isFavicon ? (
                <ImagePicker value={value} onChange={(url) => setValue(key, url)} />
              ) : (
                <input
                  className={inputCls}
                  value={value}
                  onChange={(e) => setValue(key, e.target.value)}
                />
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
