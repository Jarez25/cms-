"use client";

import { useEffect, useState } from "react";
import { notify, confirmAction } from "./feedback";

interface ComponentItem {
  id: number;
  provider_id: number | null;
  name: string;
  type: string;
  props: Record<string, unknown>;
  is_active: number;
}

interface Field {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  components: number[];
  is_active: number;
}

const TYPES: { value: string; label: string }[] = [
  { value: "cta", label: "Llamado a la acción (CTA)" },
  { value: "form", label: "Formulario" },
  { value: "products", label: "Productos (carrusel)" },
  { value: "html", label: "HTML personalizado" },
];

const TYPE_META: Record<string, { label: string; gradient: string; icon: string }> = {
  cta: {
    label: "Llamado a la acción",
    gradient: "from-blue-500 to-sky-600",
    icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46",
  },
  form: {
    label: "Formulario",
    gradient: "from-emerald-500 to-teal-600",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  products: {
    label: "Productos",
    gradient: "from-amber-500 to-orange-600",
    icon: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  },
  html: {
    label: "HTML personalizado",
    gradient: "from-rose-500 to-pink-600",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  },
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const meta = TYPE_META[type] ?? TYPE_META.html;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "w-6 h-6"}
      aria-hidden="true"
    >
      <path d={meta.icon} />
    </svg>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const emptyProps = (type: string): Record<string, unknown> => {
  if (type === "form")
    return {
      title: "",
      subtitle: "",
      submit_label: "Enviar",
      success_message: "¡Gracias! Hemos recibido tu mensaje.",
      fields: [
        { label: "Nombre", name: "nombre", type: "text", required: true },
        { label: "Email", name: "email", type: "email", required: true },
      ],
    };
  if (type === "products") return { title: "", category: "", limit: 10 };
  if (type === "cta")
    return { title: "", subtitle: "", button_text: "", button_link: "" };
  return { html: "" };
};

const str = (v: unknown): string => (v == null ? "" : String(v));

function summaryOf(c: ComponentItem): string {
  const p = c.props ?? {};
  if (c.type === "html") {
    const text = str(p.html).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return text || "Sin contenido";
  }
  if (c.type === "products") {
    const limit = p.limit != null ? ` · ${p.limit} items` : "";
    return `${str(p.title) || "Productos"}${limit}`;
  }
  if (c.type === "form") {
    const n = Array.isArray(p.fields) ? p.fields.length : 0;
    return `${str(p.title) || "Formulario"}${n ? ` · ${n} campo(s)` : ""}`;
  }
  return str(p.title) || str(p.button_text) || "Sin título";
}

const LOCATIONS = [
  { value: "home", label: "Página de inicio" },
  { value: "tienda", label: "Tienda" },
  { value: "nosotros", label: "Nosotros" },
  { value: "contacto", label: "Contacto" },
];

const isPageLocation = (loc: string) => loc.startsWith("page:");
const pageIdOf = (loc: string) => (isPageLocation(loc) ? Number(loc.slice(5)) : null);

export default function ComponentsManager({ categories }: { categories: string[] }) {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [location, setLocation] = useState("home");
  const [locIds, setLocIds] = useState<number[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{
    id: number;
    name: string;
    type: string;
    props: Record<string, unknown>;
    is_active: number;
  } | null>(null);
  const [viewingSubs, setViewingSubs] = useState<ComponentItem | null>(null);
  const [subs, setSubs] = useState<{ id: number; data: Record<string, unknown>; created_at: string }[]>([]);

  const selectedPageId = pageIdOf(location);
  const selectedPage = selectedPageId != null ? pages.find((p) => p.id === selectedPageId) : undefined;
  const currentIds = selectedPageId != null ? (selectedPage?.components ?? []) : locIds;

  async function load() {
    const [compRes, pagesRes] = await Promise.all([
      fetch("/api/components"),
      fetch("/api/pages"),
    ]);
    if (compRes.ok) setComponents(await compRes.json());
    if (pagesRes.ok) setPages(await pagesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/components"), fetch("/api/pages")])
      .then(async ([compRes, pagesRes]) => {
        const [comps, pgs] = await Promise.all([compRes.json(), pagesRes.json()]);
        if (cancelled) return;
        setComponents(comps);
        setPages(pgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPageLocation(location)) return;
    let cancelled = false;
    fetch(`/api/page-components?location=${location}`)
      .then((res) => res.json())
      .then((ids) => {
        if (cancelled) return;
        setLocIds(ids);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location]);

  async function saveLocIds(ids: number[]) {
    const pid = pageIdOf(location);
    if (pid != null) {
      const page = pages.find((p) => p.id === pid);
      if (page) {
        setPages((prev) => prev.map((p) => (p.id === pid ? { ...p, components: ids } : p)));
        await fetch(`/api/pages/${pid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...page, components: ids }),
        });
      }
      return;
    }
    setLocIds(ids);
    await fetch("/api/page-components", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, ids }),
    });
  }

  function toggleLoc(c: ComponentItem) {
    const next = currentIds.includes(c.id)
      ? currentIds.filter((id) => id !== c.id)
      : [...currentIds, c.id];
    saveLocIds(next);
  }

  function moveLoc(id: number, dir: -1 | 1) {
    const idx = currentIds.indexOf(id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= currentIds.length) return;
    const next = [...currentIds];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    saveLocIds(next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing.id === 0;
    const url = isNew ? "/api/components" : `/api/components/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify(isNew ? "Componente creado" : "Componente guardado", "success");
      setEditing(null);
      load();
      window.dispatchEvent(new Event("cms:reload-preview"));
    } else {
      notify("Error al guardar", "error");
    }
  }

  async function remove(c: ComponentItem) {
    if (
      !(await confirmAction(`¿Eliminar el componente "${c.name}"?`, { confirmText: "Eliminar" }))
    )
      return;
    const res = await fetch(`/api/components/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Componente eliminado", "success");
      load();
    } else {
      notify("Error al eliminar", "error");
    }
  }

  async function toggleActive(c: ComponentItem) {
    const res = await fetch(`/api/components/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, is_active: c.is_active ? 0 : 1 }),
    });
    if (res.ok) {
      load();
      window.dispatchEvent(new Event("cms:reload-preview"));
    }
  }

  async function viewSubmissions(c: ComponentItem) {
    setViewingSubs(c);
    const res = await fetch(`/api/components/${c.id}/submissions`);
    if (res.ok) setSubs(await res.json());
  }

  function setProp(key: string, value: unknown) {
    setEditing((e) => (e ? { ...e, props: { ...e.props, [key]: value } } : e));
  }

  function setField(idx: number, key: keyof Field, value: unknown) {
    setEditing((e) => {
      if (!e) return e;
      const fields = Array.isArray(e.props.fields) ? [...e.props.fields] : [];
      fields[idx] = { ...fields[idx], [key]: value };
      return { ...e, props: { ...e.props, fields } };
    });
  }

  const inLoc = components.filter((c) => currentIds.includes(c.id));

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{components.length} componente(s)</p>
        <button
          onClick={() =>
            setEditing({ id: 0, name: "", type: "cta", props: emptyProps("cta"), is_active: 1 })
          }
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
        >
          + Nuevo componente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Mostrar en una página</h2>
          <p className="text-xs text-gray-400">
            Elige la página y marca los componentes a mostrar.
          </p>
        </div>
        <select
          className="w-full sm:w-64 border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <optgroup label="Páginas principales">
            {LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </optgroup>
          {pages.length > 0 && (
            <optgroup label="Páginas del CMS">
              {pages.map((p) => (
                <option key={`page:${p.id}`} value={`page:${p.id}`}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="text-xs text-gray-500">
          Las páginas del CMS (creadas en «Páginas») también aparecen aquí. También puedes
          asignar componentes desde el editor de cada página.
        </p>
        {inLoc.length === 0 ? (
          <p className="text-sm text-gray-400">Ningún componente en esta página.</p>
        ) : (
          <div className="space-y-2">
            {currentIds.map((id) => {
              const c = components.find((x) => x.id === id);
              if (!c) return null;
              return (
                <div key={id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => moveLoc(id, -1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↑</button>
                    <button onClick={() => moveLoc(id, 1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↓</button>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-400 uppercase">{c.type}</span>
                  <button onClick={() => toggleLoc(c)} className="text-sm text-rose-600 hover:text-rose-800">Quitar</button>
                </div>
              );
            })}
          </div>
        )}
        {components.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {components
              .filter((c) => !currentIds.includes(c.id))
              .map((c) => (
                <button
                  key={c.id}
                  onClick={() => toggleLoc(c)}
                  className="text-sm bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg px-3 py-1.5 transition"
                >
                  + {c.name}
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {components.map((c) => {
          const meta = TYPE_META[c.type] ?? TYPE_META.html;
          return (
            <div
              key={c.id}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-md`}
                  >
                    <TypeIcon type={c.type} className="w-6 h-6" />
                  </span>
                  <span
                    className={`shrink-0 text-xs font-medium rounded-full px-2.5 py-1 ${
                      c.is_active
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {c.is_active ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 truncate" title={c.name}>
                  {c.name}
                </h3>
                <p className="text-xs uppercase tracking-wide text-gray-400 mt-0.5">
                  {meta.label}
                </p>
                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{summaryOf(c)}</p>
              </div>
              <div className="border-t border-gray-100 flex items-stretch divide-x divide-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setEditing({ ...c, props: { ...c.props } })}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(c)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  {c.is_active ? "Desactivar" : "Activar"}
                </button>
                {c.type === "form" && (
                  <button
                    onClick={() => viewSubmissions(c)}
                    className="flex-1 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                  >
                    Envíos
                  </button>
                )}
                <button
                  onClick={() => remove(c)}
                  className="flex-1 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={() =>
            setEditing({ id: 0, name: "", type: "cta", props: emptyProps("cta"), is_active: 1 })
          }
          className="min-h-[180px] rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 transition flex flex-col items-center justify-center gap-2"
        >
          <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl leading-none">
            +
          </span>
          <span className="text-sm font-medium">Nuevo componente</span>
        </button>
      </div>

      {components.length === 0 && (
        <p className="text-gray-500 py-8 text-center">No hay componentes. Crea uno para usarlo.</p>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={save} className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="font-semibold text-gray-900 text-lg">
              {editing.id === 0 ? "Nuevo componente" : "Editar componente"}
            </h2>
            <div>
              <label className={labelCls}>Nombre</label>
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select
                className={inputCls}
                value={editing.type}
                onChange={(e) => {
                  const type = e.target.value;
                  setEditing({ ...editing, type, props: emptyProps(type) });
                }}
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {editing.type === "cta" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div><label className={labelCls}>Subtítulo</label><input className={inputCls} value={str(editing.props.subtitle)} onChange={(e) => setProp("subtitle", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Texto del botón</label><input className={inputCls} value={str(editing.props.button_text)} onChange={(e) => setProp("button_text", e.target.value)} /></div>
                  <div><label className={labelCls}>Enlace del botón</label><input className={inputCls} value={str(editing.props.button_link)} onChange={(e) => setProp("button_link", e.target.value)} /></div>
                </div>
              </>
            )}

            {editing.type === "html" && (
              <div>
                <label className={labelCls}>HTML</label>
                <textarea className={inputCls + " font-mono text-sm"} rows={8} spellCheck={false} value={str(editing.props.html)} onChange={(e) => setProp("html", e.target.value)} />
              </div>
            )}

            {editing.type === "products" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div>
                  <label className={labelCls}>Categoría (opcional)</label>
                  <select className={inputCls} value={str(editing.props.category)} onChange={(e) => setProp("category", e.target.value)}>
                    <option value="">Todas</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div><label className={labelCls}>Cantidad</label><input type="number" className={inputCls} value={Number(editing.props.limit ?? 10)} onChange={(e) => setProp("limit", Number(e.target.value))} /></div>
              </>
            )}

            {editing.type === "form" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div><label className={labelCls}>Subtítulo</label><input className={inputCls} value={str(editing.props.subtitle)} onChange={(e) => setProp("subtitle", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Texto del botón</label><input className={inputCls} value={str(editing.props.submit_label ?? "Enviar")} onChange={(e) => setProp("submit_label", e.target.value)} /></div>
                  <div><label className={labelCls}>Mensaje de éxito</label><input className={inputCls} value={str(editing.props.success_message)} onChange={(e) => setProp("success_message", e.target.value)} /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Campos</label>
                    <button type="button" onClick={() => setProp("fields", [...(Array.isArray(editing.props.fields) ? editing.props.fields : []), { label: "", name: "", type: "text", required: false }])} className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1 hover:bg-gray-700">+ Campo</button>
                  </div>
                  <div className="space-y-2">
                    {(Array.isArray(editing.props.fields) ? editing.props.fields : []).map((f: Field, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={inputCls} placeholder="Etiqueta" value={f.label ?? ""} onChange={(e) => setField(i, "label", e.target.value)} />
                        <input className={inputCls} placeholder="Nombre" value={f.name ?? ""} onChange={(e) => setField(i, "name", e.target.value)} />
                        <select className={inputCls} value={f.type ?? "text"} onChange={(e) => setField(i, "type", e.target.value)}>
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="tel">Teléfono</option>
                          <option value="textarea">Área de texto</option>
                        </select>
                        <button type="button" onClick={() => setProp("fields", (Array.isArray(editing.props.fields) ? editing.props.fields : []).filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-800 px-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.is_active === 1} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {viewingSubs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setViewingSubs(null)}>
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Envíos · {viewingSubs.name}</h2>
              <button onClick={() => setViewingSubs(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            {subs.length === 0 ? (
              <p className="text-sm text-gray-400">No hay envíos todavía.</p>
            ) : (
              <div className="space-y-2">
                {subs.map((s) => (
                  <div key={s.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                    <p className="text-xs text-gray-400 mb-1">{new Date(s.created_at).toLocaleString()}</p>
                    <dl className="space-y-1">
                      {Object.entries(s.data).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="font-medium text-gray-600">{k}:</dt>
                          <dd className="text-gray-800 break-all">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
