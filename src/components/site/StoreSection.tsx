"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  currency: string;
  productBase: string;
  providerId: number | null;
  pageSize?: number;
  initialCategory?: string;
}

const PAGE_OPTIONS = [10, 24, 48];

export default function StoreSection({ currency, productBase, providerId, pageSize, initialCategory }: Props) {
  const [items, setItems] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [brand, setBrand] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [size, setSize] = useState(pageSize ?? 12);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildParams(p: number, search: string, filters: Record<string, string>): URLSearchParams {
    const params = new URLSearchParams({ page: String(p), limit: String(size) });
    if (search) params.set("q", search);
    for (const [k, v] of Object.entries(filters)) {
      if (v) params.set(k, v);
    }
    if (providerId !== null) params.set("provider", String(providerId));
    return params;
  }

  function apply(data: { items: ProductData[]; total: number; page: number; pages: number }, append: boolean) {
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }

  function currentFilters() {
    return { category, brand, min: minPrice, max: maxPrice };
  }

  function load(p: number, search: string, append = false) {
    setLoading(true);
    return fetch(`/api/public/products?${buildParams(p, search, currentFilters()).toString()}`)
      .then((res) => res.json())
      .then((data) => apply(data, append))
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    let cancelled = false;
    fetch(
      providerId === null ? "/api/public/categories" : `/api/public/categories?provider=${providerId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCategories(data);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  useEffect(() => {
    let cancelled = false;
    fetch(providerId === null ? "/api/public/brands" : `/api/public/brands?provider=${providerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setBrands(data);
      });
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  useEffect(() => {
    let cancelled = false;
    const initParams = new URLSearchParams({
      page: "1",
      limit: String(size),
      category: initialCategory ?? "",
    });
    if (providerId !== null) initParams.set("provider", String(providerId));
    fetch(`/api/public/products?${initParams.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        apply(data, false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size, providerId]);

  function onSearch(value: string) {
    setQ(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(1, value), 400);
  }

  function onFilter(key: "category" | "brand", value: string) {
    if (key === "category") setCategory(value);
    else setBrand(value);
    const filters = { category: key === "category" ? value : category, brand: key === "brand" ? value : brand, min: minPrice, max: maxPrice };
    fetch(`/api/public/products?${buildParams(1, q, filters).toString()}`)
      .then((res) => res.json())
      .then((data) => apply(data, false))
      .catch(() => setLoading(false));
  }

  function applyPrice() {
    load(1, q);
  }

  function changeSize(v: number) {
    setSize(v);
  }

  function loadMore() {
    load(page + 1, q, true);
  }

  return (
    <section id="tienda" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Catálogo
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            Nuestra Tienda
          </h2>
          <p className="text-gray-500 mt-3">
            {total > 0
              ? `${total} producto${total === 1 ? "" : "s"} disponible${total === 1 ? "" : "s"}`
              : "Productos seleccionados para ti."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-3">
            <input
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
            />
            <select
              value={category}
              onChange={(e) => onFilter("category", e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition text-gray-700"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={brand}
              onChange={(e) => onFilter("brand", e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition text-gray-700"
            >
              <option value="">Todas las marcas</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Precio:</span>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Mín"
                className="w-28 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
              />
              <span className="text-gray-400">—</span>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Máx"
                className="w-28 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light transition"
              />
              <button
                onClick={applyPrice}
                className="bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-700 transition"
              >
                Filtrar
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500">Por página:</span>
              <select
                value={size}
                onChange={(e) => changeSize(Number(e.target.value))}
                className="border border-gray-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-primary-light transition"
              >
                {PAGE_OPTIONS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {items.length === 0 && !loading && (
          <p className="text-center text-gray-500 py-16">
            No se encontraron productos con esos filtros.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`${productBase}/${p.slug}`}
              className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    sin imagen
                  </div>
                )}
                {p.brand && (
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-white">
                    {p.brand}
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                {p.category && (
                  <p className="text-gray-400 text-xs mt-1 line-clamp-1">{p.category}</p>
                )}
                <div className="flex items-center justify-between mt-4">
                  <span className="text-lg font-extrabold text-gray-900">
                    {formatPrice(p.price, currency)}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-primary transition-colors">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {loading && <p className="text-center text-gray-400 py-6">Cargando...</p>}

        {page < pages && !loading && (
          <div className="text-center mt-10">
            <button
              onClick={loadMore}
              className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full px-7 py-3 font-semibold hover:bg-gray-700 transition"
            >
              Cargar más ({total - items.length} restantes)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
