"use client";

import { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
import { notify, confirmAction } from "./feedback";

interface Provider {
  id: number;
  name: string;
  slug: string;
  email: string;
  role: string;
  logo_image: string;
  is_active: number;
  created_at: string;
}

const empty = {
  name: "",
  slug: "",
  email: "",
  logo_image: "",
  is_active: 1,
  password: "",
};

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function ProvidersManager() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [editing, setEditing] = useState<(Provider & { password: string }) | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const res = await fetch("/api/providers");
    if (res.ok) setProviders(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/providers")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProviders(data);
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
    const url = isNew ? "/api/providers" : `/api/providers/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify(isNew ? "Proveedor creado" : "Proveedor actualizado", "success");
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Error al guardar", "error");
    }
  }

  async function remove(id: number) {
    if (
      !(await confirmAction("¿Eliminar este proveedor y todo su contenido?", {
        confirmText: "Eliminar",
      }))
    )
      return;
    const res = await fetch(`/api/providers/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Proveedor eliminado", "success");
      load();
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {providers.length} proveedor(es) registrados
        </p>
        <button
          onClick={() => setEditing({ id: 0, ...empty, role: "provider", created_at: "" })}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition shadow-md shadow-blue-500/20"
        >
          + Nuevo proveedor
        </button>
      </div>

      <div className="space-y-3">
        {providers.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 text-white flex items-center justify-center font-bold overflow-hidden shrink-0">
              {p.logo_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.logo_image} alt="" className="w-full h-full object-cover" />
              ) : (
                p.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{p.name}</p>
              <p className="text-sm text-gray-500 truncate">{p.email}</p>
            </div>
            <a
              href={`/p/${p.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium shrink-0"
            >
              /p/{p.slug} ↗
            </a>
            <span
              className={`text-xs font-medium rounded-full px-2.5 py-1 shrink-0 ${
                p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {p.is_active ? "Activo" : "Inactivo"}
            </span>
            <button
              onClick={() => setEditing({ ...p, password: "" })}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium shrink-0"
            >
              Editar
            </button>
            <button
              onClick={() => remove(p.id)}
              className="text-sm text-red-600 hover:text-red-800 font-medium shrink-0"
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
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-semibold text-gray-900 text-lg">
              {editing.id === 0 ? "Nuevo proveedor" : "Editar proveedor"}
            </h2>
            <div>
              <label className={labelCls}>Nombre del negocio</label>
              <input
                className={inputCls}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Slug (URL del sitio)</label>
                <input
                  className={inputCls}
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="mi-negocio"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Su sitio será /p/{editing.slug || "mi-negocio"}
                </p>
              </div>
              <div>
                <label className={labelCls}>Email de acceso</label>
                <input
                  type="email"
                  className={inputCls}
                  value={editing.email}
                  onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>
                Contraseña {editing.id !== 0 && "(dejar vacío para no cambiar)"}
              </label>
              <input
                type="password"
                className={inputCls}
                value={editing.password}
                onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                required={editing.id === 0}
                minLength={6}
              />
            </div>
            <div>
              <label className={labelCls}>Logo del proveedor</label>
              <ImagePicker
                value={editing.logo_image}
                onChange={(url) => setEditing({ ...editing, logo_image: url })}
              />
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select
                className={inputCls}
                value={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
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
