"use client";

import { useState } from "react";

interface CdnItem {
  url: string;
  type: "css" | "js";
}

interface Props {
  initial: {
    cdn_items: CdnItem[];
    css: string;
    js_head: string;
    js_body: string;
  };
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const codeCls =
  "w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition leading-relaxed";

export default function CodeEditor({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/code", {
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

  function setCdn(i: number, key: keyof CdnItem, value: string) {
    set("cdn_items", form.cdn_items.map((c, idx) => (idx === i ? { ...c, [key]: value } : c)));
  }

  return (
    <form onSubmit={save} className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">CDNs externos</h2>
            <p className="text-sm text-gray-500">
              Carga hojas de estilo o scripts desde otros dominios (Bootstrap, Tailwind CDN,
              Google Fonts, etc.).
            </p>
          </div>
          <button
            type="button"
            onClick={() => set("cdn_items", [...form.cdn_items, { url: "", type: "css" }])}
            className="shrink-0 bg-gray-900 text-white rounded-xl px-3 py-1.5 text-sm hover:bg-gray-700"
          >
            + Añadir CDN
          </button>
        </div>
        {form.cdn_items.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <select
              className="w-24 shrink-0 border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50"
              value={item.type}
              onChange={(e) => setCdn(i, "type", e.target.value)}
            >
              <option value="css">CSS</option>
              <option value="js">JS</option>
            </select>
            <input
              className={inputCls}
              placeholder="https://cdn.ejemplo.com/style.css"
              value={item.url}
              onChange={(e) => setCdn(i, "url", e.target.value)}
            />
            <button
              type="button"
              onClick={() => set("cdn_items", form.cdn_items.filter((_, idx) => idx !== i))}
              className="shrink-0 text-red-600 hover:text-red-800 px-2 py-2"
              aria-label="Eliminar CDN"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-2">
        <h2 className="font-semibold text-gray-900">CSS personalizado</h2>
        <p className="text-sm text-gray-500">Estilos propios aplicados a todo el sitio.</p>
        <textarea
          className={codeCls}
          rows={8}
          spellCheck={false}
          placeholder={"/* Tu CSS aquí */\nbody { }"}
          value={form.css}
          onChange={(e) => set("css", e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-2">
        <h2 className="font-semibold text-gray-900">JavaScript (arriba)</h2>
        <p className="text-sm text-gray-500">Se ejecuta al inicio de la página.</p>
        <textarea
          className={codeCls}
          rows={8}
          spellCheck={false}
          placeholder={"// Tu JS aquí"}
          value={form.js_head}
          onChange={(e) => set("js_head", e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-2">
        <h2 className="font-semibold text-gray-900">JavaScript (abajo)</h2>
        <p className="text-sm text-gray-500">
          Se ejecuta al final de la página (ideal para scripts que dependen del DOM).
        </p>
        <textarea
          className={codeCls}
          rows={8}
          spellCheck={false}
          placeholder={"// Tu JS aquí"}
          value={form.js_body}
          onChange={(e) => set("js_body", e.target.value)}
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-6 py-2.5 font-medium hover:from-blue-500 hover:to-sky-500 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando..." : "Guardar código"}
        </button>
        {status === "saved" && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {status === "error" && <span className="text-red-600 text-sm">Error al guardar</span>}
      </div>
    </form>
  );
}
