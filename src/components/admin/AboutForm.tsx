"use client";

import { useState } from "react";
import ImagePicker from "./ImagePicker";

interface Props {
  initial: {
    title: string;
    subtitle: string;
    content: string;
    image: string;
  };
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function AboutForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/about", {
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
        <h2 className="font-semibold text-gray-900">Sección Nosotros</h2>
        <div>
          <label className={labelCls}>Título</label>
          <input
            className={inputCls}
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Subtítulo</label>
          <input
            className={inputCls}
            value={form.subtitle}
            onChange={(e) => set("subtitle", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Contenido</label>
          <textarea
            className={inputCls}
            rows={6}
            value={form.content}
            onChange={(e) => set("content", e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Imagen</label>
          <ImagePicker value={form.image} onChange={(url) => set("image", url)} />
        </div>
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
