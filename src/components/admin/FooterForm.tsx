"use client";

import { useState } from "react";

interface SocialLink {
  label: string;
  url: string;
}

interface Props {
  initial: {
    about_text: string;
    address: string;
    phone: string;
    email: string;
    copyright: string;
    social_links: SocialLink[];
  };
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function FooterForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/footer", {
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
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Información del footer</h2>
        <div>
          <label className={labelCls}>Texto sobre nosotros</label>
          <textarea
            className={inputCls}
            rows={3}
            value={form.about_text}
            onChange={(e) => set("about_text", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Dirección</label>
            <input
              className={inputCls}
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Email</label>
          <input
            className={inputCls}
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Copyright</label>
          <input
            className={inputCls}
            value={form.copyright}
            onChange={(e) => set("copyright", e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Redes sociales</h2>
          <button
            type="button"
            onClick={() => set("social_links", [...form.social_links, { label: "", url: "" }])}
            className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
          >
            + Añadir red
          </button>
        </div>
        {form.social_links.map((item, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input
              className={inputCls}
              placeholder="Nombre"
              value={item.label}
              onChange={(e) =>
                set(
                  "social_links",
                  form.social_links.map((s, idx) =>
                    idx === i ? { ...s, label: e.target.value } : s
                  )
                )
              }
            />
            <input
              className={inputCls}
              placeholder="https://..."
              value={item.url}
              onChange={(e) =>
                set(
                  "social_links",
                  form.social_links.map((s, idx) => (idx === i ? { ...s, url: e.target.value } : s))
                )
              }
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
