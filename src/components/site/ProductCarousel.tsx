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
    scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.8), behavior: "smooth" });
  }

  return (
    <section className="py-10">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
            {title}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href={seeAllHref}
              className="text-sm font-medium text-primary hover:text-primary-dark hidden sm:inline"
            >
              Ver todo →
            </Link>
            <button
              onClick={() => scroll(-1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
              aria-label="Anterior"
            >
              ‹
            </button>
            <button
              onClick={() => scroll(1)}
              className="w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-600 transition"
              aria-label="Siguiente"
            >
              ›
            </button>
          </div>
        </div>

        <div
          ref={scroller}
          className="flex gap-5 overflow-x-auto scroll-smooth snap-x pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {products.map((p) => (
            <Link
              key={p.id}
              href={`${productBase}/${p.slug}`}
              className="w-[190px] md:w-[220px] shrink-0 snap-start group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
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
                  <span className="absolute top-2 left-2 bg-gray-900/80 backdrop-blur rounded-full px-2.5 py-0.5 text-[11px] font-medium text-white">
                    {p.brand}
                  </span>
                )}
              </div>
              <div className="p-3.5">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 leading-snug group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <p className="font-extrabold text-gray-900 mt-2">
                  {formatPrice(p.price, currency)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
