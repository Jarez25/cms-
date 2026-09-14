"use client";

import { useEffect, useState } from "react";
import { notify, confirmAction } from "./feedback";

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  components: number[];
  is_active: number;
}

interface ComponentOption {
  id: number;
  name: string;
}

const empty = { title: "", slug: "", content: "", components: [] as number[], is_active: 1 };

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function PagesManager({ basePath }: { basePath: string }) {
  const [pages, setPages] = useState<Page[]>([]);
  const [editing, setEditing] = useState<(Page & { id: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [components, setComponents] = useState<ComponentOption[]>([]);
  const [addComponentId, setAddComponentId] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/components")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setComponents(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function load() {
    const res = await fetch("/api/pages");
    if (res.ok) setPages(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setPages(data);
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
    const url = isNew ? "/api/pages" : `/api/pages/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify(isNew ? "Página creada" : "Página actualizada", "success");
      setEditing(null);
      load();
    } else {
      const data = await res.json().catch(() => ({}));
      notify(data.error || "Error al guardar", "error");
    }
  }

  async function remove(id: number) {
    if (!(await confirmAction("¿Eliminar esta página?", { confirmText: "Eliminar" }))) return;
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Página eliminada", "success");
      load();
    }
  }

  function addComponent() {
    if (!editing || !addComponentId) return;
    const id = Number(addComponentId);
    if (editing.components.includes(id)) return;
    setEditing({ ...editing, components: [...editing.components, id] });
    setAddComponentId("");
  }

  function removeComponent(id: number) {
    if (!editing) return;
    setEditing({ ...editing, components: editing.components.filter((x) => x !== id) });
  }

  function moveComponent(id: number, dir: -1 | 1) {
    if (!editing) return;
    const idx = editing.components.indexOf(id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= editing.components.length) return;
    const next = [...editing.components];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    setEditing({ ...editing, components: next });
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{pages.length} página(s)</p>
        <button
          onClick={() => setEditing({ id: 0, ...empty })}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
        >
          + Nueva página
        </button>
      </div>

      <div className="space-y-3">
        {pages.length === 0 && (
          <p className="text-gray-500 py-8 text-center">
            No hay páginas. Crea una para añadirla al menú.
          </p>
        )}
        {pages.map((p) => (
          <div
            key={p.id}
            className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">{p.title}</p>
              <a
                href={`${basePath}/pagina/${p.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {basePath}/pagina/{p.slug}
              </a>
            </div>
            <span
              className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                p.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
              }`}
            >
              {p.is_active ? "Activa" : "Inactiva"}
            </span>
            <button
              onClick={() => setEditing(p)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Editar
            </button>
            <button
              onClick={() => remove(p.id)}
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
            className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-semibold text-gray-900 text-lg">
              {editing.id === 0 ? "Nueva página" : "Editar página"}
            </h2>
            <div>
              <label className={labelCls}>Título</label>
              <input
                className={inputCls}
                value={editing.title}
                onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                required
              />
            </div>
            {editing.id === 0 && (
              <div>
                <label className={labelCls}>Dirección (slug, opcional)</label>
                <input
                  className={inputCls}
                  value={editing.slug}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  placeholder="mi-pagina"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Su URL será {basePath}/pagina/{editing.slug || "mi-pagina"}
                </p>
              </div>
            )}
            <div>
              <label className={labelCls}>Contenido (HTML)</label>
              <textarea
                className={inputCls + " font-mono text-sm"}
                rows={10}
                spellCheck={false}
                value={editing.content}
                onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                placeholder={"<h2>Bienvenidos</h2>\n<p>Contenido de la página...</p>"}
              />
            </div>
            <div>
              <label className={labelCls}>Componentes de la página</label>
              {editing.components.length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {editing.components.map((id) => {
                    const c = components.find((x) => x.id === id);
                    return (
                      <div key={id} className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-2 py-1.5">
                        <button type="button" onClick={() => moveComponent(id, -1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↑</button>
                        <button type="button" onClick={() => moveComponent(id, 1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↓</button>
                        <span className="flex-1 text-sm text-gray-800">{c ? c.name : `#${id}`}</span>
                        <button type="button" onClick={() => removeComponent(id)} className="text-rose-600 hover:text-rose-800">✕</button>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="flex gap-2">
                <select
                  className={inputCls}
                  value={addComponentId}
                  onChange={(e) => setAddComponentId(e.target.value)}
                >
                  <option value="">Añadir componente...</option>
                  {components
                    .filter((c) => !editing.components.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
                <button
                  type="button"
                  onClick={addComponent}
                  disabled={!addComponentId}
                  className="shrink-0 bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                >
                  Añadir
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                También puedes incrustar un componente dentro del contenido con{" "}
                <code className="font-mono">[component id=&quot;N&quot;]</code>.
              </p>
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
