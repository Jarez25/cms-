"use client";

import { useRef } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  title: string;
  products: ProductData[];
  currency: string;
  productBase: string;
  seeAllHref: string;
}

export default function ProductCarousel({ title, products, currency, productBase, seeAllHref }: Props) {
  const scroller = useRef<HTMLDivElement>(null);

  if (!products.length) return null;

  function scroll(dir: number) {
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.75), behavior: "smooth" });
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabecera del Carrusel */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            <p className="text-gray-500 text-xs md:text-sm mt-0.5">
              Productos seleccionados con disponibilidad inmediata
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={seeAllHref}
              className="text-xs md:text-sm font-bold text-primary hover:text-primary-dark transition-colors mr-2 hidden sm:inline-flex items-center gap-1"
            >
              <span>Ver todos</span>
              <span>→</span>
            </Link>
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition active:scale-95 shadow-2xs cursor-pointer"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-100 flex items-center justify-center text-gray-700 transition active:scale-95 shadow-2xs cursor-pointer"
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>

        {/* Carrusel Horizontal */}
        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x pb-4 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`${productBase}/${p.slug}`}
              className="w-[210px] md:w-[240px] shrink-0 snap-start group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
            >
              {/* Imagen con Badges */}
              <div className="aspect-square bg-gray-50 overflow-hidden relative border-b border-gray-100">
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

                {/* Marca pill */}
                {p.brand && (
                  <span className="absolute top-3 left-3 bg-gray-900/85 backdrop-blur-md rounded-full px-2.5 py-0.5 text-[10px] font-bold text-white tracking-wide uppercase">
                    {p.brand}
                  </span>
                )}

                {/* Stock indicator */}
                {p.stock <= 5 && p.stock > 0 && (
                  <span className="absolute bottom-2.5 right-2.5 bg-rose-500/90 text-white rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide shadow-xs">
                    Últimas {p.stock}
                  </span>
                )}

                {/* Badge de Descuento si compare_price > price */}
                {p.compare_price && p.compare_price > p.price && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white rounded-full px-2 py-0.5 text-[11px] font-black tracking-tight shadow-md animate-pulse">
                    -{Math.round(((p.compare_price - p.price) / p.compare_price) * 100)}%
                  </span>
                )}
              </div>

              {/* Información del Producto */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  {p.category && (
                    <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
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
                          p.compare_price && p.compare_price > p.price
                            ? "text-red-600"
                            : "text-gray-950"
                        }`}
                      >
                        {formatPrice(p.price, currency)}
                      </p>
                      {p.compare_price && p.compare_price > p.price && (
                        <span
                          suppressHydrationWarning
                          className="text-xs text-gray-400 line-through font-medium"
                        >
                          {formatPrice(p.compare_price, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="w-8 h-8 rounded-full bg-gray-100 text-gray-700 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-sm font-bold shadow-2xs">
                    →
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
