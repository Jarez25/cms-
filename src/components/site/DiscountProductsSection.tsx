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

export default function DiscountProductsSection({
  products,
  currency,
  productBase = "/producto",
  seeAllHref = "/tienda",
  title = "🔥 Ofertas & Descuentos Especiales",
  subtitle = "Precios rebajados por tiempo limitado con entrega rápida garantizada",
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
    const distance = 360;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (!products.length) return null;

  return (
    <section className="py-14 bg-gradient-to-b from-red-50/40 via-white to-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabecera de Ofertas */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Ofertas Flash · Liquidación</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>{title}</span>
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={seeAllHref}
              className="text-xs md:text-sm font-bold text-red-600 hover:text-red-700 transition inline-flex items-center gap-1"
            >
              Ver todas las ofertas &rarr;
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

        {/* Carrusel de Productos en Descuento */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-5 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {products.map((p) => {
            const hasDiscount = p.compare_price && p.compare_price > p.price;
            const discountPercent = hasDiscount
              ? Math.round(((p.compare_price! - p.price) / p.compare_price!) * 100)
              : null;
            const savings = hasDiscount ? p.compare_price! - p.price : 0;

            return (
              <Link
                key={p.id}
                href={`${productBase}/${p.slug}`}
                className="group w-[230px] sm:w-[260px] flex-shrink-0 bg-white rounded-3xl border border-red-100 shadow-sm hover:shadow-xl hover:border-red-300 transition-all duration-300 flex flex-col justify-between overflow-hidden product-card"
              >
                {/* Imagen del Producto */}
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

                  {/* Badge de Descuento Destacado */}
                  {discountPercent && (
                    <span className="absolute top-3 left-3 bg-red-600 text-white rounded-full px-2.5 py-1 text-xs font-black tracking-tight shadow-md flex items-center gap-1">
                      <span>🏷️</span>
                      <span>-{discountPercent}% OFF</span>
                    </span>
                  )}

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
                      <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block mb-1">
                        {p.category}
                      </span>
                    )}
                    <h3 className="font-bold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                      {p.name}
                    </h3>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <div className="flex items-baseline gap-2">
                      <p suppressHydrationWarning className="text-lg font-black text-red-600 tracking-tight">
                        {formatPrice(p.price, currency)}
                      </p>
                      {hasDiscount && (
                        <span suppressHydrationWarning className="text-xs text-gray-400 line-through font-semibold">
                          {formatPrice(p.compare_price!, currency)}
                        </span>
                      )}
                    </div>

                    {hasDiscount && (
                      <span suppressHydrationWarning className="inline-block mt-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        Ahorras {formatPrice(savings, currency)}
                      </span>
                    )}

                    <div className="mt-3 w-full py-2 rounded-xl bg-red-600 group-hover:bg-red-700 text-white text-xs font-bold text-center transition shadow-sm shadow-red-500/20">
                      Aprovechar Oferta &rarr;
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
