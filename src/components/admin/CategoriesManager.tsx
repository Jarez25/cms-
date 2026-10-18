"use client";

import { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
import { notify, confirmAction } from "./feedback";

interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  description: string;
  is_active: number;
  is_hidden: number;
}

const empty: Omit<Category, "id"> = {
  name: "",
  slug: "",
  image: "",
  description: "",
  is_active: 1,
  is_hidden: 0,
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3.5 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary transition text-sm";
const labelCls = "block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) setCategories(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCategories(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing.id === 0;
    const url = isNew ? "/api/categories" : `/api/categories/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify(isNew ? "Colección creada exitosamente" : "Colección actualizada", "success");
      setEditing(null);
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Error al guardar la colección", "error");
    }
  }

  async function remove(id: number) {
    if (!(await confirmAction("¿Eliminar esta colección de la tienda?", { confirmText: "Eliminar" }))) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Colección eliminada", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    }
  }

  async function toggleHide(c: Category) {
    const res = await fetch(`/api/categories/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, is_hidden: c.is_hidden ? 0 : 1 }),
    });
    if (res.ok) {
      notify(c.is_hidden ? "Colección ahora visible en tienda" : "Colección oculta", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
        <p className="text-gray-500 text-sm mt-3">Cargando colecciones...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Barra de Herramientas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Colecciones & Categorías</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            {categories.length} colección(es) configuradas. Las imágenes se muestran como burbujas circulares en la tienda.
          </p>
        </div>
        <button
          onClick={() => setEditing({ id: 0, ...empty })}
          className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-sm transition active:scale-95 shrink-0"
        >
          <span>+ Nueva Colección</span>
        </button>
      </div>

      {/* Lista de Colecciones */}
      <div className="grid grid-cols-1 gap-3.5">
        {categories.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <span className="text-4xl">🏷️</span>
            <p className="font-bold text-gray-800 mt-2">No hay colecciones creadas todavía.</p>
            <p className="text-xs text-gray-500 mt-1">
              Crea tu primera colección para organizar tus productos como en WordPress/WooCommerce.
            </p>
            <button
              onClick={() => setEditing({ id: 0, ...empty })}
              className="mt-4 bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl"
            >
              Crear primera colección
            </button>
          </div>
        ) : (
          categories.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-2xl shadow-xs border border-gray-200/90 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-gray-300 transition"
            >
              {/* Burbuja Circular Preview */}
              <div className="relative flex-shrink-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full p-0.5 ring-2 ring-primary/30 overflow-hidden shadow-xs bg-gray-100">
                  {c.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-light to-primary text-white flex items-center justify-center font-black text-lg">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Información */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-gray-900 text-base">{c.name}</h3>
                  <span
                    className={`text-[10px] font-black rounded-full px-2 py-0.5 uppercase tracking-wide ${
                      c.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.is_active ? "Activa" : "Inactiva"}
                  </span>
                  {c.is_hidden ? (
                    <span className="text-[10px] font-black rounded-full px-2 py-0.5 bg-rose-100 text-rose-700 uppercase tracking-wide">
                      Oculta en tienda
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                  <span className="font-mono text-gray-400">/tienda?category={encodeURIComponent(c.name)}</span>
                  {c.description ? ` · ${c.description}` : ""}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-gray-100 w-full sm:w-auto justify-end">
                <a
                  href={`/tienda?category=${encodeURIComponent(c.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                  title="Ver en la tienda"
                >
                  Ver en tienda ↗
                </a>
                <button
                  type="button"
                  onClick={() => toggleHide(c)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition"
                >
                  {c.is_hidden ? "Mostrar" : "Ocultar"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(c)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black transition shadow-xs"
                >
                  Editar
                </button>
                <button
                  type="button"
                  onClick={() => remove(c.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 transition"
                  title="Eliminar colección"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Creación / Edición */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <form
            onSubmit={save}
            className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-xl space-y-5 max-h-[90vh] overflow-y-auto border border-gray-100"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h2 className="font-extrabold text-gray-900 text-lg">
                {editing.id === 0 ? "✨ Nueva Colección / Categoría" : "✏️ Editar Colección"}
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Simulación en vivo de la Burbuja Circular */}
            <div className="rounded-2xl bg-gray-50 p-4 border border-gray-200/70 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full p-0.5 ring-4 ring-primary shadow-md overflow-hidden bg-white">
                  {editing.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={editing.image}
                      alt={editing.name || "Vista previa"}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-gray-900 to-primary text-white flex items-center justify-center font-black text-xl">
                      {editing.name ? editing.name.charAt(0).toUpperCase() : "🏷️"}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-wide block text-[10px]">
                  Vista previa de la burbuja en la tienda:
                </span>
                <span className="font-extrabold text-gray-900 text-sm block mt-0.5">
                  {editing.name || "Nombre de la colección"}
                </span>
                <span className="text-gray-500 block text-[11px] mt-0.5">
                  Aparecerá en el carrusel circular superior de la tienda.
                </span>
              </div>
            </div>

            {/* Selector de Imagen con ImagePicker */}
            <div>
              <label className={labelCls}>Imagen de Portada de la Colección</label>
              <ImagePicker
                value={editing.image || ""}
                onChange={(url) => setEditing({ ...editing, image: url })}
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Se ajustará automáticamente en formato circular perfecto.
              </p>
            </div>

            {/* Nombre */}
            <div>
              <label className={labelCls}>Nombre de la Colección</label>
              <input
                className={inputCls}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Ej. Audio & Sonido, Setup Minimalista..."
                required
              />
            </div>

            {/* Slug URL */}
            <div>
              <label className={labelCls}>Slug URL (Opcional)</label>
              <input
                className={inputCls}
                value={editing.slug}
                onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                placeholder="ej. audio-y-sonido (se genera automáticamente si se deja vacío)"
              />
            </div>

            {/* Descripción */}
            <div>
              <label className={labelCls}>Descripción de la Colección</label>
              <textarea
                className={`${inputCls} h-20 resize-none`}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                placeholder="Breve explicación de los productos incluidos en esta colección..."
              />
            </div>

            {/* Estado */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Estado</label>
                <select
                  className={inputCls}
                  value={editing.is_active}
                  onChange={(e) => setEditing({ ...editing, is_active: Number(e.target.value) })}
                >
                  <option value={1}>Activa</option>
                  <option value={0}>Inactiva</option>
                </select>
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editing.is_hidden === 1}
                    onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked ? 1 : 0 })}
                    className="w-4 h-4 rounded accent-primary cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-gray-700">
                    Ocultar en tienda
                  </span>
                </label>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gray-900 hover:bg-black text-white rounded-xl px-6 py-2.5 text-xs font-bold shadow-md transition active:scale-95"
              >
                {editing.id === 0 ? "Crear Colección" : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
