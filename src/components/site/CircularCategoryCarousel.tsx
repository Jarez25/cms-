"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import type { CategorySummary } from "@/lib/data";

interface Props {
  items: CategorySummary[];
  basePath?: string;
  activeCategory?: string;
  onSelectCategory?: (cat: string) => void;
  title?: string;
  subtitle?: string;
}

export default function CircularCategoryCarousel({
  items,
  basePath = "",
  activeCategory = "",
  onSelectCategory,
  title = "Explora por Categoría",
  subtitle = "Encuentra lo que buscas navegando por nuestras colecciones destacadas",
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
  }, [items]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = 320;
    el.scrollBy({
      left: direction === "left" ? -distance : distance,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (!items.length) return null;

  const totalProducts = items.reduce((acc, c) => acc + c.count, 0);

  return (
    <section className="py-10 bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        {/* Cabecera del Carrusel de Categorías */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <span>Colecciones</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-500 text-xs md:text-sm mt-1 max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {/* Botones de navegación del carrusel */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Anterior"
              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                canScrollLeft
                  ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-sm active:scale-95"
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
                  ? "border-gray-200 bg-white text-gray-800 hover:bg-gray-50 hover:border-gray-300 shadow-sm active:scale-95"
                  : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
              }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carrusel de Burbujas Circulares */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-start gap-5 sm:gap-7 overflow-x-auto no-scrollbar scroll-smooth py-2 px-1"
        >
          {/* Opción de "Todas" */}
          <div className="flex-shrink-0 flex flex-col items-center">
            {onSelectCategory ? (
              <button
                type="button"
                onClick={() => onSelectCategory("")}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div
                  className={`relative p-1 rounded-full transition-all duration-300 ${
                    !activeCategory
                      ? "ring-4 ring-primary shadow-lg shadow-primary/25 scale-105"
                      : "ring-2 ring-gray-200 hover:ring-primary/60 hover:shadow-md"
                  }`}
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-gradient-to-tr from-gray-900 via-gray-800 to-primary flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">✨</span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm border border-white">
                    {totalProducts}
                  </span>
                </div>
                <span
                  className={`mt-2.5 text-xs sm:text-sm font-bold text-center line-clamp-1 max-w-[85px] sm:max-w-[100px] transition-colors ${
                    !activeCategory ? "text-primary font-black" : "text-gray-700 group-hover:text-primary"
                  }`}
                >
                  Todas
                </span>
              </button>
            ) : (
              <Link
                href={`${basePath}/tienda`}
                className="group flex flex-col items-center focus:outline-none"
              >
                <div className="relative p-1 rounded-full ring-2 ring-gray-200 hover:ring-primary/60 hover:shadow-md transition-all duration-300">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full bg-gradient-to-tr from-gray-900 via-gray-800 to-primary flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">✨</span>
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm border border-white">
                    {totalProducts}
                  </span>
                </div>
                <span className="mt-2.5 text-xs sm:text-sm font-bold text-center text-gray-700 group-hover:text-primary line-clamp-1 max-w-[85px] sm:max-w-[100px] transition-colors">
                  Todas
                </span>
              </Link>
            )}
          </div>

          {/* Burbujas de Cada Categoría */}
          {items.map((cat) => {
            const isSelected = activeCategory === cat.category;
            const cleanName = cat.category.split(">").pop()?.trim() || cat.category;

            const content = (
              <div
                className={`relative p-1 rounded-full transition-all duration-300 ${
                  isSelected
                    ? "ring-4 ring-primary shadow-lg shadow-primary/25 scale-105"
                    : "ring-2 ring-gray-200/90 hover:ring-primary/60 hover:shadow-md"
                }`}
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-26 md:h-26 rounded-full overflow-hidden bg-gray-100 relative shadow-sm">
                  {cat.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image}
                      alt={cleanName}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-115 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full bg-gradient-to-br from-primary-light to-primary flex items-center justify-center text-white font-black text-xl">
                      {cleanName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Overlay sutil para realzar la estética */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                </div>

                {/* Badge de cantidad */}
                <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm border border-white">
                  {cat.count}
                </span>
              </div>
            );

            return (
              <div key={cat.category} className="flex-shrink-0 flex flex-col items-center">
                {onSelectCategory ? (
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.category)}
                    className="group flex flex-col items-center focus:outline-none"
                  >
                    {content}
                    <span
                      className={`mt-2.5 text-xs sm:text-sm font-bold text-center line-clamp-1 max-w-[85px] sm:max-w-[105px] transition-colors ${
                        isSelected ? "text-primary font-black" : "text-gray-800 group-hover:text-primary"
                      }`}
                      title={cleanName}
                    >
                      {cleanName}
                    </span>
                  </button>
                ) : (
                  <Link
                    href={`${basePath}/tienda?category=${encodeURIComponent(cat.category)}`}
                    className="group flex flex-col items-center focus:outline-none"
                  >
                    {content}
                    <span
                      className={`mt-2.5 text-xs sm:text-sm font-bold text-center line-clamp-1 max-w-[85px] sm:max-w-[105px] transition-colors ${
                        isSelected ? "text-primary font-black" : "text-gray-800 group-hover:text-primary"
                      }`}
                      title={cleanName}
                    >
                      {cleanName}
                    </span>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
