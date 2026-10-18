"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  products: ProductData[];
  currency: string;
  productBase?: string;
  seeAllHref?: string;
  title?: string;
  subtitle?: string;
}

export default function LatestProductsSection({
  products,
  currency,
  productBase = "/producto",
  seeAllHref = "/tienda",
  title = "✨ Novedades & Recién Llegados",
  subtitle = "Descubre los últimos lanzamientos de alta tecnología incorporados a nuestro inventario",
}: Props) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = 340;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (!products.length) return null;

  return (
    <section className="py-14 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabecera */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Nuevos Ingresos</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={seeAllHref}
              className="text-xs md:text-sm font-bold text-primary hover:text-primary-dark transition inline-flex items-center gap-1"
            >
              Ver catálogo completo &rarr;
            </Link>

            <div className="flex items-center gap-1.5 ml-2">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Anterior"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                  canScrollLeft
                    ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 shadow-sm active:scale-95"
                    : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Siguiente"
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                  canScrollRight
                    ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 shadow-sm active:scale-95"
                    : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Carrusel de Novedades */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`${productBase}/${p.slug}`}
              className="group w-[220px] sm:w-[250px] flex-shrink-0 bg-white rounded-3xl border border-gray-200/90 shadow-sm hover:shadow-xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between overflow-hidden product-card"
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

                {/* Badge NUEVO */}
                <span className="absolute top-3 left-3 bg-emerald-600 text-white rounded-full px-2.5 py-0.5 text-[11px] font-black tracking-wide shadow-md">
                  ✨ NUEVO
                </span>

                {/* Badge de Marca */}
                {p.brand && (
                  <span className="absolute top-3 right-3 bg-gray-900/80 backdrop-blur-md rounded-full px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    {p.brand}
                  </span>
                )}
              </div>

              {/* Contenido */}
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
                    <p suppressHydrationWarning className="text-base font-extrabold text-gray-950 tracking-tight">
                      {formatPrice(p.price, currency)}
                    </p>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-sm font-bold shadow-2xs">
                    &rarr;
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
