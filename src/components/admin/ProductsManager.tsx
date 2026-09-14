"use client";

import { useEffect, useState } from "react";
import ImagePicker from "./ImagePicker";
import { notify, confirmAction } from "./feedback";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
  is_active: number;
  is_hidden: number;
  sort_order: number;
}

const empty = (): Omit<Product, "id" | "slug"> => ({
  name: "",
  sku: "",
  description: "",
  price: 0,
  image: "",
  category: "",
  brand: "",
  stock: 0,
  is_active: 1,
  is_hidden: 0,
  sort_order: 0,
});

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const PAGE_SIZE = 20;

export default function ProductsManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editing, setEditing] = useState<(Product & { slug: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [q, setQ] = useState("");
  const [appliedQ, setAppliedQ] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setCategories(data.map((c: { name: string }) => c.name));
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/brands")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setBrands(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  async function load(p: number, search: string, cat = categoryFilter, br = brandFilter) {
    setLoading(true);
    const params = new URLSearchParams({
      page: String(p),
      limit: String(PAGE_SIZE),
      q: search,
    });
    if (cat) params.set("category", cat);
    if (br) params.set("brand", br);
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.items);
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/products?page=1&limit=${PAGE_SIZE}&q=`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(data.items);
        setTotal(data.total);
        setPage(data.page);
        setPages(data.pages);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function reload() {
    load(page, appliedQ);
  }

  function search(value: string) {
    setQ(value);
    setAppliedQ(value);
    load(1, value);
  }

  function filterCategory(value: string) {
    setCategoryFilter(value);
    load(1, appliedQ, value, brandFilter);
  }

  function filterBrand(value: string) {
    setBrandFilter(value);
    load(1, appliedQ, categoryFilter, value);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing.id === 0;
    const url = isNew ? "/api/products" : `/api/products/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify("Producto guardado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      setEditing(null);
      reload();
    } else {
      notify("Error al guardar", "error");
    }
  }

  async function remove(id: number) {
    if (!(await confirmAction("¿Eliminar este producto?", { confirmText: "Eliminar" }))) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Producto eliminado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      reload();
    }
  }

  async function duplicate(p: Product) {
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: `${p.name} (copia)`,
        sku: p.sku,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        brand: p.brand,
        stock: p.stock,
        is_active: p.is_active,
        sort_order: p.sort_order,
      }),
    });
    if (res.ok) {
      notify("Producto duplicado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      reload();
    } else {
      notify("Error al duplicar", "error");
    }
  }

  async function toggleHide(p: Product) {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...p, is_hidden: p.is_hidden ? 0 : 1 }),
    });
    if (res.ok) {
      notify(p.is_hidden ? "Producto visible" : "Producto oculto", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      reload();
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={q}
          onChange={(e) => search(e.target.value)}
          placeholder="Buscar producto..."
          className="flex-1 min-w-[180px] max-w-xs border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <select
          value={categoryFilter}
          onChange={(e) => filterCategory(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition max-w-[220px]"
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={brandFilter}
          onChange={(e) => filterBrand(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition max-w-[160px]"
        >
          <option value="">Todas las marcas</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
        <p className="text-sm text-gray-500 ml-auto">
          {total} producto(s) · página {page} de {pages}
        </p>
        <button
          onClick={() => setEditing({ id: 0, slug: "", ...empty() })}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
        >
          + Nuevo producto
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <p className="text-gray-500 py-8 text-center">Cargando...</p>
        ) : products.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No hay productos.</p>
        ) : (
          products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
            >
              {p.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.image} alt="" className="h-14 w-14 object-cover rounded-lg bg-gray-50" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  sin img
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{p.name}</p>
                <p className="text-sm text-gray-500 truncate">
                  {p.sku ? `SKU: ${p.sku} · ` : ""}
                  {p.brand || "Sin marca"}
                  {p.category ? ` · ${p.category}` : ""} · Stock: {p.stock}
                </p>
              </div>
              <span className="font-semibold text-gray-900">
                {Number(p.price).toLocaleString()}
              </span>
              <span
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  p.is_active ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                }`}
              >
                {p.is_active ? "Publicado" : "Borrador"}
              </span>
              {p.is_hidden ? (
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-rose-100 text-rose-700">
                  Oculto
                </span>
              ) : null}
              <button
                onClick={() => toggleHide(p)}
                title={p.is_hidden ? "Mostrar en el sitio" : "Ocultar del sitio"}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {p.is_hidden ? "Mostrar" : "Ocultar"}
              </button>
              <button
                onClick={() => setEditing(p)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => duplicate(p)}
                title="Duplicar"
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Duplicar
              </button>
              <button
                onClick={() => remove(p.id)}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Eliminar
              </button>
            </div>
          ))
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => load(page - 1, appliedQ)}
            disabled={page <= 1 || loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            ← Anterior
          </button>
          <span className="text-sm text-gray-500">
            Página {page} de {pages}
          </span>
          <button
            onClick={() => load(page + 1, appliedQ)}
            disabled={page >= pages || loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
          >
            Siguiente →
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={save}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <h2 className="font-semibold text-gray-900">
              {editing.id === 0 ? "Nuevo producto" : "Editar producto"}
            </h2>
            <div>
              <label className={labelCls}>Nombre</label>
              <input
                className={inputCls}
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>SKU</label>
                <input
                  className={inputCls}
                  value={editing.sku}
                  onChange={(e) => setEditing({ ...editing, sku: e.target.value })}
                />
              </div>
              {editing.id === 0 && (
                <div>
                  <label className={labelCls}>Slug (opcional)</label>
                  <input
                    className={inputCls}
                    value={editing.slug}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div>
              <label className={labelCls}>Descripción</label>
              <textarea
                className={inputCls}
                rows={3}
                value={editing.description}
                onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              />
            </div>
            <div>
              <label className={labelCls}>Imagen</label>
              <ImagePicker
                value={editing.image}
                onChange={(url) => setEditing({ ...editing, image: url })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Precio</label>
                <input
                  type="number"
                  step="0.01"
                  className={inputCls}
                  value={editing.price}
                  onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className={labelCls}>Stock</label>
                <input
                  type="number"
                  className={inputCls}
                  value={editing.stock}
                  onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Categoría</label>
                {categories.length > 0 ? (
                  <>
                    <select
                      className={inputCls}
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                    >
                      <option value="">Sin categoría</option>
                      {categories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <input
                      className={inputCls + " mt-2"}
                      value={editing.category}
                      onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                      placeholder="o escribe una nueva"
                    />
                  </>
                ) : (
                  <input
                    className={inputCls}
                    value={editing.category}
                    onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  />
                )}
              </div>
              <div>
                <label className={labelCls}>Marca</label>
                <input
                  className={inputCls}
                  value={editing.brand}
                  onChange={(e) => setEditing({ ...editing, brand: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Orden</label>
                <input
                  type="number"
                  className={inputCls}
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className={labelCls}>Estado</label>
              <select
                className={inputCls}
                value={editing.is_active}
                onChange={(e) => setEditing({ ...editing, is_active: Number(e.target.value) })}
              >
                <option value={1}>Publicado</option>
                <option value={0}>Borrador</option>
              </select>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={editing.is_hidden === 1}
                onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked ? 1 : 0 })}
                className="w-4 h-4 rounded accent-blue-600"
              />
              <span className="text-sm text-gray-700">Oculto del sitio (no se muestra)</span>
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditing(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-700"
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
