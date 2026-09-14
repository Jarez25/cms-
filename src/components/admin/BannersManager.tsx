"use client";

import { useEffect, useMemo, useState } from "react";
import ImagePicker from "./ImagePicker";
import { notify, confirmAction } from "./feedback";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  image_position: string;
  text_position: string;
  button_text: string;
  button_link: string;
  is_active: number;
  is_hidden: number;
  sort_order: number;
}

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  image: string;
  category: string;
  brand: string;
  stock: number;
}

const empty = (): Omit<Banner, "id"> => ({
  title: "",
  subtitle: "",
  image: "",
  image_position: "right",
  text_position: "left",
  button_text: "",
  button_link: "",
  is_active: 1,
  is_hidden: 0,
  sort_order: 0,
});

const inputCls =
  "w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  async function load() {
    const res = await fetch("/api/banners");
    setBanners(await res.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    fetch("/api/banners")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setBanners(data);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/products?limit=500")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setProducts(Array.isArray(data?.items) ? data.items : []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort(),
    [products]
  );
  const brands = useMemo(
    () => Array.from(new Set(products.map((p) => p.brand).filter(Boolean))).sort(),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const matchQ =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.sku || "").toLowerCase().includes(q) ||
        (p.category || "").toLowerCase().includes(q) ||
        (p.brand || "").toLowerCase().includes(q);
      const matchCat = !category || p.category === category;
      const matchBrand = !brand || p.brand === brand;
      return matchQ && matchCat && matchBrand;
    });
  }, [products, query, category, brand]);

  function startNew() {
    setEditing({ id: 0, ...empty() });
    setSelectedProduct(null);
    setQuery("");
    setCategory("");
    setBrand("");
  }

  function startEdit(b: Banner) {
    setEditing(b);
    setSelectedProduct(null);
    setQuery("");
    setCategory("");
    setBrand("");
  }

  function selectProduct(p: Product) {
    setSelectedProduct(p);
    setEditing((prev) => (prev ? { ...prev, image: p.image } : prev));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = !("id" in editing) || editing.id === 0;
    const url = isNew ? "/api/banners" : `/api/banners/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify("Banner guardado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      setEditing(null);
      setSelectedProduct(null);
      load();
    } else {
      notify("Error al guardar", "error");
    }
  }

  async function remove(id: number) {
    if (!(await confirmAction("¿Eliminar este banner?", { confirmText: "Eliminar" }))) return;
    const res = await fetch(`/api/banners/${id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Banner eliminado", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    }
  }

  async function toggleHidden(b: Banner) {
    const res = await fetch(`/api/banners/${b.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...b, is_hidden: b.is_hidden ? 0 : 1 }),
    });
    if (res.ok) {
      notify(b.is_hidden ? "Banner visible" : "Banner oculto", "success");
      window.dispatchEvent(new Event("cms:reload-preview"));
      load();
    }
  }

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {banners.length} banner(s) · {banners.filter((b) => b.is_active).length} activo(s)
        </p>
        <button
          onClick={startNew}
          className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700"
        >
          + Nuevo banner
        </button>
      </div>

      {editing ? (
        <form onSubmit={save} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna izquierda: campos del banner */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">
                  {editing.id === 0 ? "Nuevo banner" : "Editar banner"}
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Cancelar
                </button>
              </div>

              <div>
                <label className={labelCls}>Título</label>
                <input
                  className={inputCls}
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <label className={labelCls}>Subtítulo</label>
                <input
                  className={inputCls}
                  value={editing.subtitle}
                  onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })}
                />
              </div>

              <div>
                <label className={labelCls}>Imagen</label>
                <ImagePicker
                  value={editing.image}
                  onChange={(url) => setEditing({ ...editing, image: url })}
                />
                {selectedProduct && (
                  <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50 border border-blue-200 px-3 py-2 text-sm text-blue-800">
                    <span className="w-8 h-8 rounded bg-white overflow-hidden shrink-0">
                      {selectedProduct.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={selectedProduct.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : null}
                    </span>
                    <span className="truncate">
                      Producto seleccionado: <strong>{selectedProduct.name}</strong>
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Posición de la foto</label>
                  <select
                    className={inputCls}
                    value={editing.image_position}
                    onChange={(e) =>
                      setEditing({ ...editing, image_position: e.target.value })
                    }
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Posición del texto</label>
                  <select
                    className={inputCls}
                    value={editing.text_position}
                    onChange={(e) =>
                      setEditing({ ...editing, text_position: e.target.value })
                    }
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Texto del botón</label>
                  <input
                    className={inputCls}
                    value={editing.button_text}
                    onChange={(e) => setEditing({ ...editing, button_text: e.target.value })}
                  />
                </div>
                <div>
                  <label className={labelCls}>Enlace del botón</label>
                  <input
                    className={inputCls}
                    value={editing.button_link}
                    onChange={(e) => setEditing({ ...editing, button_link: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelCls}>Enlace rápido a la tienda</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    className={inputCls}
                    value=""
                    onChange={(e) => {
                      const c = e.target.value;
                      if (!c) return;
                      setEditing((prev) =>
                        prev
                          ? {
                              ...prev,
                              button_link: `/tienda?category=${encodeURIComponent(c)}`,
                              button_text: prev.button_text || `Ver ${c}`,
                            }
                          : prev
                      );
                    }}
                  >
                    <option value="">Filtrar por categoría…</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Genera automáticamente el enlace del botón para una categoría de la tienda.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Orden</label>
                  <input
                    type="number"
                    className={inputCls}
                    value={editing.sort_order}
                    onChange={(e) =>
                      setEditing({ ...editing, sort_order: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className={labelCls}>Estado</label>
                  <select
                    className={inputCls}
                    value={editing.is_active}
                    onChange={(e) =>
                      setEditing({ ...editing, is_active: Number(e.target.value) })
                    }
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={editing.is_hidden === 1}
                  onChange={(e) =>
                    setEditing({ ...editing, is_hidden: e.target.checked ? 1 : 0 })
                  }
                  className="mt-0.5 w-4 h-4 rounded accent-blue-600"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-700">Ocultar del sitio</span>
                  <span className="block text-xs text-gray-400">
                    No se mostrará en la portada aunque esté activo.
                  </span>
                </span>
              </label>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="submit"
                  className="bg-gray-900 text-white rounded-lg px-5 py-2 text-sm font-medium hover:bg-gray-700"
                >
                  Guardar
                </button>
              </div>
            </div>
          </div>

          {/* Columna derecha: selector de producto */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col">
            <h2 className="font-semibold text-gray-900">Foto de un producto</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">
              Busca y elige un producto para usar su foto como imagen del banner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <input
                className={inputCls}
                placeholder="Buscar nombre, SKU…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                className={inputCls}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select
                className={inputCls}
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
              >
                <option value="">Todas las marcas</option>
                {brands.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[520px] border border-gray-200 rounded-xl divide-y divide-gray-100">
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">
                  No hay productos que coincidan.
                </p>
              ) : (
                filteredProducts.map((p) => (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => selectProduct(p)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition hover:bg-blue-50 ${
                      selectedProduct?.id === p.id ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : ""
                    }`}
                  >
                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                          —
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {[p.sku && `SKU ${p.sku}`, p.category, p.brand]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {Number(p.price).toLocaleString()}
                      </p>
                      <p
                        className={`text-xs font-medium ${
                          p.stock > 0 ? "text-green-600" : "text-rose-600"
                        }`}
                      >
                        {p.stock > 0 ? `${p.stock} uds` : "Sin stock"}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-4"
            >
              {b.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.image} alt="" className="h-14 w-20 object-cover rounded-lg bg-gray-50" />
              ) : (
                <div className="h-14 w-20 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 text-xs">
                  sin img
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{b.title || "Sin título"}</p>
                <p className="text-sm text-gray-500 truncate">{b.subtitle}</p>
              </div>
              <span
                className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                  b.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {b.is_active ? "Activo" : "Inactivo"}
              </span>
              {b.is_hidden === 1 && (
                <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-amber-100 text-amber-700">
                  Oculto
                </span>
              )}
              <button
                onClick={() => startEdit(b)}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Editar
              </button>
              <button
                onClick={() => toggleHidden(b)}
                className="text-sm text-amber-600 hover:text-amber-800 font-medium"
              >
                {b.is_hidden === 1 ? "Mostrar" : "Ocultar"}
              </button>
              <button
                onClick={() => remove(b.id)}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Eliminar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
