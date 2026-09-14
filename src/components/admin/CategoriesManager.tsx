"use client";

import { useEffect, useState } from "react";
import { notify, confirmAction } from "./feedback";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  is_active: number;
  is_hidden: number;
}

const empty = { name: "", slug: "", description: "", is_active: 1, is_hidden: 0 };

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<(Category & { id: number }) | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/categories");
    if (res.ok) setCategories(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCategories(data);
        setLoading(false);
      });
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
      notify(isNew ? "Categoría creada" : "Categoría actualizada", "success");
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Error al guardar", "error");
    }
  }

  async function remove(id: number) {
    if (!(await confirmAction("¿Eliminar esta categoría?", { confirmText: "Eliminar" }))) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Categoría eliminada", "success");
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
      notify(c.is_hidden ? "Categoría visible" : "Categoría oculta", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{categories.length} categoría(s)</p>
        <button
          onClick={() => setEditing({ id: 0, ...empty })}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
        >
          + Nueva categoría
        </button>
      </div>

      <div className="space-y-3">
        {categories.length === 0 && (
          <p className="text-gray-500 py-8 text-center">No hay categorías.</p>
        )}
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{c.name}</p>
              <p className="text-sm text-gray-500 truncate">
                slug: {c.slug}
                {c.description ? ` · ${c.description}` : ""}
              </p>
            </div>
            <span
              className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                c.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {c.is_active ? "Activa" : "Inactiva"}
            </span>
            {c.is_hidden ? (
              <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-rose-100 text-rose-700">
                Oculta
              </span>
            ) : null}
            <button
              onClick={() => toggleHide(c)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              {c.is_hidden ? "Mostrar" : "Ocultar"}
            </button>
            <button
              onClick={() => setEditing(c)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => remove(c.id)}
              className="text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={save}
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="font-semibold text-gray-900 text-lg">
              {editing.id === 0 ? "Nueva categoría" : "Editar categoría"}
            </h2>
            <div>
              <label className={labelCls}>Nombre</label>
              <input
                className={inputCls}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </div>
            {editing.id === 0 && (
              <div>
                <label className={labelCls}>Slug (opcional)</label>
                <input
                  className={inputCls}
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="mi-categoria"
                />
              </div>
            )}
            <div>
              <label className={labelCls}>Descripción</label>
              <input
                className={inputCls}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_hidden === 1}
                onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-gray-700">
                Oculta del sitio (también oculta sus productos)
              </span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
