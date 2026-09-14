"use client";

import { useEffect, useMemo, useState } from "react";
import { notify, confirmAction } from "./feedback";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  children: MenuItem[];
}

interface Menu {
  id: number;
  provider_id: number | null;
  name: string;
  is_active: number;
  items: MenuItem[];
}

interface Props {
  pages: { title: string; slug: string }[];
  categories: string[];
  pageBase: string;
  categoryBase: string;
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

function newId(): string {
  return `m-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function clone(items: MenuItem[]): MenuItem[] {
  return items.map((it) => ({ ...it, children: clone(it.children) }));
}

function replaceDeep(
  items: MenuItem[],
  id: string,
  patch: Partial<MenuItem>
): MenuItem[] {
  return items.map((it) =>
    it.id === id
      ? { ...it, ...patch }
      : { ...it, children: replaceDeep(it.children, id, patch) }
  );
}

function removeDeep(items: MenuItem[], id: string): MenuItem[] {
  return items
    .filter((it) => it.id !== id)
    .map((it) => ({ ...it, children: removeDeep(it.children, id) }));
}

function addChildDeep(items: MenuItem[], id: string, child: MenuItem): MenuItem[] {
  return items.map((it) =>
    it.id === id
      ? { ...it, children: [...it.children, child] }
      : { ...it, children: addChildDeep(it.children, id, child) }
  );
}

function findParent(
  items: MenuItem[],
  id: string
): { list: MenuItem[]; index: number } | null {
  for (let i = 0; i < items.length; i++) {
    if (items[i].id === id) return { list: items, index: i };
    const found = findParent(items[i].children, id);
    if (found) return found;
  }
  return null;
}

function findItemWithParent(
  items: MenuItem[],
  id: string,
  parent: MenuItem | null = null
): { item: MenuItem; parent: MenuItem | null; grandList: MenuItem[] } | null {
  for (const it of items) {
    if (it.id === id) return { item: it, parent, grandList: items };
    const found = findItemWithParent(it.children, id, it);
    if (found) return found;
  }
  return null;
}

function moveItem(items: MenuItem[], id: string, dir: -1 | 1): MenuItem[] {
  const tree = clone(items);
  const found = findParent(tree, id);
  if (!found) return items;
  const { list, index } = found;
  const target = index + dir;
  if (target < 0 || target >= list.length) return items;
  const [item] = list.splice(index, 1);
  list.splice(target, 0, item);
  return tree;
}

function indentItem(items: MenuItem[], id: string): MenuItem[] {
  const tree = clone(items);
  const found = findParent(tree, id);
  if (!found) return items;
  const { list, index } = found;
  if (index === 0) return items;
  const prev = list[index - 1];
  const [item] = list.splice(index, 1);
  prev.children = [...prev.children, item];
  return tree;
}

function outdentItem(items: MenuItem[], id: string): MenuItem[] {
  const tree = clone(items);
  const found = findItemWithParent(tree, id);
  if (!found || !found.parent) return items;
  const { parent, grandList } = found;
  const parentIndex = grandList.findIndex((x) => x.id === parent.id);
  parent.children = parent.children.filter((c) => c.id !== id);
  grandList.splice(parentIndex + 1, 0, found.item);
  return tree;
}

const btnBase =
  "w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition disabled:opacity-30 disabled:cursor-not-allowed";

export default function MenusManager({ pages, categories, pageBase, categoryBase }: Props) {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(1);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newMenuName, setNewMenuName] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [customHref, setCustomHref] = useState("");
  const [dirty, setDirty] = useState(false);

  const selected = useMemo(
    () => menus.find((m) => m.id === selectedId) ?? null,
    [menus, selectedId]
  );

  async function load() {
    const res = await fetch("/api/menus");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data: Menu[] = await res.json();
    setMenus(data);
    if (!selectedId && data.length) select(data[0].id, data);
    else if (selectedId) {
      const cur = data.find((m) => m.id === selectedId);
      if (cur) {
        setName(cur.name);
        setIsActive(cur.is_active);
        setItems(cur.items);
      }
    }
    setLoading(false);
  }

  function select(id: number, list?: Menu[]) {
    const src = list ?? menus;
    const menu = src.find((m) => m.id === id);
    if (!menu) return;
    setSelectedId(id);
    setName(menu.name);
    setIsActive(menu.is_active);
    setItems(menu.items);
    setDirty(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/menus")
      .then((res) => res.json())
      .then((data: Menu[]) => {
        if (cancelled) return;
        setMenus(data);
        if (data.length) select(data[0].id, data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createMenu() {
    const n = newMenuName.trim();
    if (!n) return;
    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: n }),
    });
    if (res.ok) {
      const created: Menu = await res.json();
      setNewMenuName("");
      await load();
      select(created.id);
      notify("Menú creado", "success");
    } else {
      notify("Error al crear el menú", "error");
    }
  }

  async function saveMenu() {
    if (!selectedId) return;
    setSaving(true);
    const res = await fetch(`/api/menus/${selectedId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, is_active: isActive, items }),
    });
    setSaving(false);
    if (res.ok) {
      const updated: Menu = await res.json();
      setMenus((list) => list.map((m) => (m.id === updated.id ? updated : m)));
      setItems(updated.items);
      setDirty(false);
      notify("Menú guardado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
    } else {
      notify("Error al guardar", "error");
    }
  }

  async function deleteMenu() {
    if (!selectedId) return;
    if (!(await confirmAction(`¿Eliminar el menú "${name}"?`, { confirmText: "Eliminar" })))
      return;
    const res = await fetch(`/api/menus/${selectedId}`, { method: "DELETE" });
    if (res.ok) {
      const remaining = menus.filter((m) => m.id !== selectedId);
      setMenus(remaining);
      setSelectedId(null);
      setItems([]);
      setName("");
      notify("Menú eliminado", "success");
    } else {
      notify("Error al eliminar", "error");
    }
  }

  function toggleActive() {
    const next = isActive === 1 ? 0 : 1;
    setIsActive(next);
    setDirty(true);
  }

  function addItem(it: MenuItem) {
    setItems((prev) => [...prev, it]);
    setDirty(true);
  }

  function addCustom() {
    const label = customLabel.trim();
    const href = customHref.trim();
    if (!label) return;
    addItem({ id: newId(), label, href: href || "#", children: [] });
    setCustomLabel("");
    setCustomHref("");
  }

  function mutate(next: MenuItem[] | ((prev: MenuItem[]) => MenuItem[])) {
    setItems((prev) => {
      const result = typeof next === "function" ? next(prev) : next;
      setDirty(true);
      return result;
    });
  }

  function renderItems(list: MenuItem[], depth: number): React.ReactNode {
    return list.map((item) => (
      <div key={item.id}>
        <div
          className="flex items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-2 py-2"
          style={{ marginLeft: depth * 22 }}
        >
          <div className="flex flex-col gap-0.5 shrink-0">
            <div className="flex">
              <button
                type="button"
                className={btnBase}
                title="Subir"
                onClick={() => mutate((p) => moveItem(p, item.id, -1))}
              >
                ↑
              </button>
              <button
                type="button"
                className={btnBase}
                title="Bajar"
                onClick={() => mutate((p) => moveItem(p, item.id, 1))}
              >
                ↓
              </button>
            </div>
            <div className="flex">
              <button
                type="button"
                className={btnBase}
                title="Anidar (subelemento)"
                onClick={() => mutate((p) => indentItem(p, item.id))}
              >
                →
              </button>
              <button
                type="button"
                className={btnBase}
                title="Desanidar"
                onClick={() => mutate((p) => outdentItem(p, item.id))}
              >
                ←
              </button>
            </div>
          </div>
          <input
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Texto del enlace"
            value={item.label}
            onChange={(e) => mutate((p) => replaceDeep(p, item.id, { label: e.target.value }))}
          />
          <input
            className="flex-1 min-w-0 border border-gray-200 rounded-lg px-2.5 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="/ruta"
            value={item.href}
            onChange={(e) => mutate((p) => replaceDeep(p, item.id, { href: e.target.value }))}
          />
          <button
            type="button"
            className={btnBase}
            title="Añadir subelemento"
            onClick={() =>
              mutate((p) =>
                addChildDeep(p, item.id, { id: newId(), label: "", href: "#", children: [] })
              )
            }
          >
            ＋
          </button>
          <button
            type="button"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 hover:text-red-700 transition"
            title="Eliminar"
            onClick={() => mutate((p) => removeDeep(p, item.id))}
          >
            ✕
          </button>
        </div>
        {item.children.length > 0 && renderItems(item.children, depth + 1)}
      </div>
    ));
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Lista de menús */}
      <div className="space-y-4">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Menús</h2>
          <div className="space-y-1.5">
            {menus.length === 0 && (
              <p className="text-sm text-gray-500">No hay menús todavía.</p>
            )}
            {menus.map((m) => (
              <button
                key={m.id}
                onClick={() => select(m.id)}
                className={`w-full text-left rounded-xl px-3 py-2.5 text-sm font-medium transition flex items-center gap-2 ${
                  selectedId === m.id
                    ? "bg-gradient-to-r from-blue-600 to-sky-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="flex-1 truncate">{m.name}</span>
                <span
                  className={`text-[10px] font-semibold rounded-full px-2 py-0.5 ${
                    m.is_active
                      ? selectedId === m.id
                        ? "bg-white/20 text-white"
                        : "bg-green-100 text-green-700"
                      : selectedId === m.id
                        ? "bg-white/20 text-white"
                        : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {m.is_active ? "Activo" : "Inactivo"}
                </span>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-gray-100 space-y-2">
            <input
              className={inputCls}
              placeholder="Nombre del nuevo menú"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  createMenu();
                }
              }}
            />
            <button
              onClick={createMenu}
              disabled={!newMenuName.trim()}
              className="w-full bg-gray-900 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"
            >
              + Crear menú
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 text-sm text-gray-500 space-y-2">
          <p>
            Los menús <span className="font-medium text-gray-700">inactivos</span> no se muestran.
            Asigna cuál se usa en el header desde{" "}
            <span className="font-medium text-gray-700">Header → Menú del header</span>.
          </p>
        </div>
      </div>

      {/* Editor del menú seleccionado */}
      <div className="lg:col-span-2 space-y-4">
        {!selected ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-10 text-center text-gray-400">
            Crea o selecciona un menú para editarlo.
          </div>
        ) : (
          <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
              <div className="flex flex-wrap items-end gap-4">
                <div className="flex-1 min-w-[200px]">
                  <label className={labelCls}>Nombre del menú</label>
                  <input
                    className={inputCls}
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setDirty(true);
                    }}
                  />
                </div>
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isActive === 1}
                    onChange={toggleActive}
                    className="w-4 h-4 rounded accent-blue-600"
                  />
                  <span className="text-sm font-medium text-gray-700">Mostrar menú</span>
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={saveMenu}
                    disabled={saving || !dirty}
                    className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-blue-500 hover:to-sky-500 disabled:opacity-50"
                  >
                    {saving ? "Guardando..." : "Guardar menú"}
                  </button>
                  <button
                    onClick={deleteMenu}
                    className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-800 rounded-xl border border-red-200 hover:bg-red-50"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>

            {/* Añadir elementos */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Añadir elementos al menú</h3>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-2">Enlace personalizado</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    className={inputCls}
                    placeholder="Texto (p. ej. Ofertas)"
                    value={customLabel}
                    onChange={(e) => setCustomLabel(e.target.value)}
                  />
                  <input
                    className={inputCls}
                    placeholder="https://... o /ruta"
                    value={customHref}
                    onChange={(e) => setCustomHref(e.target.value)}
                  />
                  <button
                    onClick={addCustom}
                    disabled={!customLabel.trim()}
                    className="shrink-0 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-500 disabled:opacity-50"
                  >
                    Añadir
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Páginas <span className="text-gray-400">(clic para añadir)</span>
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {pages.length === 0 && (
                      <p className="text-sm text-gray-400">No hay páginas.</p>
                    )}
                    {pages.map((p) => (
                      <button
                        key={p.slug}
                        onClick={() =>
                          addItem({
                            id: newId(),
                            label: p.title,
                            href: `${pageBase}/${p.slug}`,
                            children: [],
                          })
                        }
                        className="w-full text-left rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        {p.title}
                        <span className="block text-xs text-gray-400 font-mono">
                          {pageBase}/{p.slug}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Categorías <span className="text-gray-400">(clic para añadir)</span>
                  </p>
                  <div className="max-h-48 overflow-y-auto space-y-1">
                    {categories.length === 0 && (
                      <p className="text-sm text-gray-400">No hay categorías.</p>
                    )}
                    {categories.map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          addItem({
                            id: newId(),
                            label: c.split(">").pop()?.trim() || c,
                            href: `${categoryBase}?category=${encodeURIComponent(c)}`,
                            children: [],
                          })
                        }
                        className="w-full text-left rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Estructura del menú */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">Estructura</h3>
                <button
                  onClick={() =>
                    addItem({ id: newId(), label: "", href: "#", children: [] })
                  }
                  className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1.5 hover:bg-gray-700"
                >
                  + Añadir enlace
                </button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-gray-400 py-6 text-center">
                  Este menú está vacío. Añade enlaces, páginas o categorías.
                </p>
              ) : (
                <div className="space-y-2">
                  {renderItems(items, 0)}
                  <p className="text-xs text-gray-400 pt-1">
                    Usa ↑ ↓ para reordenar, → para anidar como subelemento y ← para desanidar.
                  </p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
