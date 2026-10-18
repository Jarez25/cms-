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
  onCategoryChange?: (category: string) => void;
}

export default function StoreSection({
  currency,
  productBase,
  providerId,
  pageSize = 16,
  initialCategory,
  onCategoryChange,
}: Props) {
  const [items, setItems] = useState<ProductData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(initialCategory ?? "");
  const [brand, setBrand] = useState("");
  const [sortBy, setSortBy] = useState<"default" | "price_asc" | "price_desc" | "newest">("default");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function buildParams(p: number, search: string, selectedCategory: string, selectedBrand: string): URLSearchParams {
    const params = new URLSearchParams({ page: String(p), limit: String(pageSize) });
    if (search) params.set("q", search);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedBrand) params.set("brand", selectedBrand);
    if (providerId !== null) params.set("provider", String(providerId));
    return params;
  }

  function sortItems(list: ProductData[], sortMode: typeof sortBy) {
    const clone = [...list];
    if (sortMode === "price_asc") {
      return clone.sort((a, b) => Number(a.price) - Number(b.price));
    }
    if (sortMode === "price_desc") {
      return clone.sort((a, b) => Number(b.price) - Number(a.price));
    }
    if (sortMode === "newest") {
      return clone.sort((a, b) => b.id - a.id);
    }
    return clone;
  }

  function apply(data: { items: ProductData[]; total: number; page: number; pages: number }, append: boolean) {
    setItems((prev) => (append ? [...prev, ...data.items] : data.items));
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }

  function load(p: number, search: string, cat: string, br: string, append = false) {
    setLoading(true);
    return fetch(`/api/public/products?${buildParams(p, search, cat, br).toString()}`)
      .then((res) => res.json())
      .then((data) => apply(data, append))
      .catch(() => setLoading(false));
  }

  // Sincronizar si cambia initialCategory desde fuera
  useEffect(() => {
    if (initialCategory !== undefined && initialCategory !== category) {
      setCategory(initialCategory);
      load(1, q, initialCategory, brand);
    }
  }, [initialCategory]);

  useEffect(() => {
    let cancelled = false;
    fetch(providerId === null ? "/api/public/brands" : `/api/public/brands?provider=${providerId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setBrands(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [providerId]);

  useEffect(() => {
    load(1, q, category, brand);
  }, []);

  function onSearch(val: string) {
    setQ(val);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      load(1, val, category, brand);
    }, 280);
  }

  function selectCategory(c: string) {
    setCategory(c);
    if (onCategoryChange) onCategoryChange(c);
    load(1, q, c, brand);
  }

  function selectBrand(b: string) {
    const nextBrand = brand === b ? "" : b;
    setBrand(nextBrand);
    load(1, q, category, nextBrand);
  }

  function loadMore() {
    if (page < pages) {
      load(page + 1, q, category, brand, true);
    }
  }

  const displayedItems = sortItems(items, sortBy);

  return (
    <section id="tienda" className="py-14 bg-gray-50/70">
      <div className="max-w-6xl mx-auto px-4">
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <span>Catálogo Oficial</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-950 tracking-tight">
              {category ? category : "Todos los Productos"}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {total > 0
                ? `Mostrando ${displayedItems.length} de ${total} productos disponibles`
                : "Buscando productos disponibles..."}
            </p>
          </div>

          {/* Ordenamiento Limpio */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-500">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              <option value="default">Recomendados</option>
              <option value="price_asc">Precio: Menor a Mayor</option>
              <option value="price_desc">Precio: Mayor a Menor</option>
              <option value="newest">Más Nuevos</option>
            </select>
          </div>
        </div>

        {/* Barra de Búsqueda Despejada y Filtros Rápidos */}
        <div className="bg-white rounded-3xl border border-gray-200/90 shadow-sm p-4 mb-8 space-y-3.5">
          <div className="relative">
            <input
              type="search"
              value={q}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Buscar por nombre, categoría o marca..."
              className="w-full bg-gray-50/70 border border-gray-200 rounded-2xl pl-11 pr-10 py-3 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary transition"
            />
            <span className="absolute left-3.5 top-3.5 text-gray-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            {q && (
              <button
                type="button"
                onClick={() => onSearch("")}
                className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕ Limpiar
              </button>
            )}
          </div>

          {/* Filtros Rápidos de Marca (chips discretos) */}
          {brands.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
              <span className="text-xs font-semibold text-gray-400 shrink-0">Marcas:</span>
              <button
                type="button"
                onClick={() => selectBrand("")}
                className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                  !brand
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Todas
              </button>
              {brands.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => selectBrand(b)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition shrink-0 ${
                    brand === b
                      ? "bg-primary text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Grilla de Productos */}
        {loading && items.length === 0 ? (
          <div className="py-20 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em]" />
            <p className="text-gray-500 text-sm mt-3 font-medium">Cargando productos...</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-12 text-center max-w-lg mx-auto">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-gray-900 mt-3">No encontramos productos</h3>
            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Intenta con otra palabra clave o limpia los filtros activos.
            </p>
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("");
                setBrand("");
                load(1, "", "", "");
              }}
              className="mt-4 px-4 py-2 bg-gray-900 text-white text-xs font-bold rounded-xl hover:bg-black transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {displayedItems.map((p) => {
              const hasDiscount = p.compare_price && p.compare_price > p.price;
              const discountPercent = hasDiscount
                ? Math.round(((p.compare_price! - p.price) / p.compare_price!) * 100)
                : null;

              return (
                <Link
                  key={p.id}
                  href={`${productBase}/${p.slug}`}
                  className="group bg-white rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden product-card"
                >
                  {/* Imagen */}
                  <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image}
                        alt={p.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-gray-300 text-xs">
                        Sin imagen
                      </div>
                    )}

                    {/* Badge de Descuento si aplica */}
                    {discountPercent ? (
                      <span className="absolute top-3 left-3 bg-red-600 text-white rounded-full px-2 py-0.5 text-[10px] font-black tracking-tight shadow-md animate-pulse">
                        -{discountPercent}% OFF
                      </span>
                    ) : p.stock <= 5 && p.stock > 0 ? (
                      <span className="absolute top-3 left-3 bg-amber-500 text-white rounded-full px-2 py-0.5 text-[10px] font-bold shadow-xs">
                        Últimas {p.stock}
                      </span>
                    ) : null}

                    {/* Marca */}
                    {p.brand && (
                      <span className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                        {p.brand}
                      </span>
                    )}
                  </div>

                  {/* Información */}
                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      {p.category && (
                        <span className="text-[11px] font-bold text-primary uppercase tracking-wider block mb-1">
                          {p.category}
                        </span>
                      )}
                      <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-medium">Precio</span>
                        <div className="flex items-baseline gap-1.5">
                          <p
                            suppressHydrationWarning
                            className={`text-base font-extrabold tracking-tight ${
                              hasDiscount ? "text-red-600" : "text-gray-950"
                            }`}
                          >
                            {formatPrice(p.price, currency)}
                          </p>
                          {hasDiscount && (
                            <span
                              suppressHydrationWarning
                              className="text-xs text-gray-400 line-through font-medium"
                            >
                              {formatPrice(p.compare_price!, currency)}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-sm font-bold shadow-2xs">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Botón de Cargar Más */}
        {page < pages && (
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
            >
              {loading ? "Cargando más productos..." : "Cargar más productos"}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
