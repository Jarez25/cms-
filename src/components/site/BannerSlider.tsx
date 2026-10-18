"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  image: string;
  image_position: string;
  text_position: string;
  button_text: string;
  button_link: string;
}

const DURATION = 6500;

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION);
  const touchX = useRef<number | null>(null);

  const count = banners.length;
  const active = count === 0 ? 0 : Math.min(index, count - 1);

  const goTo = useCallback(
    (i: number) => {
      remaining.current = DURATION;
      setProgress(0);
      setIndex((i + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (count <= 1) return;
    let last = Date.now();
    const timer = setInterval(() => {
      const now = Date.now();
      const dt = now - last;
      last = now;
      if (paused) return;
      remaining.current -= dt;
      if (remaining.current <= 0) {
        remaining.current = DURATION;
        setIndex((i) => (i + 1) % count);
        setProgress(0);
      } else {
        setProgress(((DURATION - remaining.current) / DURATION) * 100);
      }
    }, 50);
    return () => clearInterval(timer);
  }, [count, paused]);

  useEffect(() => {
    if (count <= 1) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(active - 1);
      if (e.key === "ArrowRight") goTo(active + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, active, goTo]);

  if (count === 0) return null;
  const current = banners[active];
  const isImageLeft = current.image_position === "left";

  return (
    <section
      className="relative overflow-hidden bg-[#060913] text-white select-none border-b border-gray-900"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 48) goTo(active + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Banners destacados"
    >
      {/* Fondo con ambient mesh y malla sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-gray-950 to-[#060913] pointer-events-none" />
      <div className="absolute -top-32 -left-32 h-[34rem] w-[34rem] rounded-full bg-primary/20 blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 h-[32rem] w-[32rem] rounded-full bg-indigo-500/15 blur-[140px] pointer-events-none" />
      
      {/* Patrón de puntos sutil para textura de estudio */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="container-site relative z-10 py-12 md:py-16 lg:py-20">
        {/* Layout Principal: Grid de 12 Columnas Ultra-Profesional */}
        <div
          key={current.id}
          className="grid grid-cols-1 lg:grid-cols-12 items-center gap-8 lg:gap-14 min-h-[460px] md:min-h-[520px]"
        >
          {/* Columna de Texto / Especificaciones */}
          <div
            className={`flex flex-col justify-center ${
              isImageLeft
                ? "lg:col-span-7 lg:order-2 text-left"
                : "lg:col-span-7 lg:order-1 text-left"
            }`}
          >
            {/* Badge de Categoría / Status */}
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/90 backdrop-blur-md mb-6 self-start animate-in fade-in slide-in-from-bottom-2 duration-500">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-light opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-light" />
              </span>
              <span>
                {current.title.toLowerCase().includes("sony") || current.title.toLowerCase().includes("audio")
                  ? "🎧 Flagship Hi-Res Audio"
                  : current.title.toLowerCase().includes("teclado") || current.title.toLowerCase().includes("gaming")
                  ? "⌨️ Custom Studio & Setup"
                  : current.title.toLowerCase().includes("watch") || current.title.toLowerCase().includes("smart")
                  ? "⌚ Titanio Aeroespacial · WR100"
                  : "🚀 Lanzamiento Oficial 2026"}
              </span>
            </div>

            {/* Título Principal */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.06] text-balance bg-gradient-to-b from-white via-white to-gray-400 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
              {current.title}
            </h1>

            {/* Subtítulo Descriptivo */}
            {current.subtitle && (
              <p className="mt-5 max-w-xl text-base sm:text-lg text-gray-300 leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-700">
                {current.subtitle}
              </p>
            )}

            {/* Chips de Especificaciones Técnicas Clave */}
            <div className="mt-6 flex flex-wrap items-center gap-2.5 animate-in fade-in slide-in-from-bottom-7 duration-700">
              {current.title.toLowerCase().includes("sony") || current.title.toLowerCase().includes("audio") ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>⚡</span> 30h Batería + Fast Charge
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🔇</span> 8 Micrófonos ANC V1
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🎵</span> LDAC Hi-Res Wireless
                  </span>
                </>
              ) : current.title.toLowerCase().includes("teclado") || current.title.toLowerCase().includes("gaming") ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🛡️</span> Chasis Aluminio CNC 6063
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🎛️</span> Hot-Swappable 5-Pin
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>📡</span> Triple Modo (2.4G / BT / USB)
                  </span>
                </>
              ) : current.title.toLowerCase().includes("watch") || current.title.toLowerCase().includes("smart") ? (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-orange-500/30 bg-orange-500/10 px-3 py-1.5 text-xs font-medium text-orange-200 backdrop-blur-md">
                    <span>☀️</span> Pantalla 3,000 Nits OLED
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-medium text-cyan-200 backdrop-blur-md">
                    <span>🌊</span> Sumergible 100m / Buceo 40m
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🧭</span> GPS Dual L1+L5
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🔋</span> Hasta 72h Batería
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>⚡</span> Despacho Express 24h
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 backdrop-blur-md">
                    <span>🛡️</span> Garantía Oficial 12 Meses
                  </span>
                </>
              )}
            </div>

            {/* Botones de Acción */}
            {current.button_text && (
              <div className="mt-8 flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <Link
                  href={current.button_link || "/tienda"}
                  className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary via-primary-light to-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-98 transition-all"
                >
                  <span>{current.button_text}</span>
                  <span className="text-lg">→</span>
                </Link>
                <Link
                  href="/tienda"
                  className="inline-flex items-center gap-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/15 px-6 py-4 font-semibold text-white/90 text-sm transition-all"
                >
                  <span>Explorar catálogo completo</span>
                </Link>
              </div>
            )}
          </div>

          {/* Columna de Imagen / Showcase del Producto */}
          {current.image && (
            <div
              className={`relative flex items-center justify-center ${
                isImageLeft
                  ? "lg:col-span-5 lg:order-1"
                  : "lg:col-span-5 lg:order-2"
              }`}
            >
              {/* Aura de iluminación trasera */}
              <div className={`absolute w-72 h-72 md:w-96 md:h-96 rounded-full blur-3xl pointer-events-none ${
                current.title.toLowerCase().includes("watch") || current.title.toLowerCase().includes("smart")
                  ? "bg-orange-500/25"
                  : "bg-primary/25"
              }`} />

              {/* Tarjeta del Producto Flotante */}
              <div className="relative w-full aspect-square max-w-[430px] rounded-3xl overflow-hidden ring-1 ring-white/15 shadow-2xl bg-gradient-to-b from-white/15 via-white/5 to-transparent backdrop-blur-xl p-3.5 group">
                <div className="w-full h-full rounded-2xl overflow-hidden relative bg-black/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent pointer-events-none" />

                  {/* Badge flotante superior */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between text-xs font-semibold text-white/90 pointer-events-none">
                    <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15">
                      Edición 2026
                    </span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                      ● En Stock
                    </span>
                  </div>

                  {/* Detalle inferior */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs font-semibold text-white/90">
                    <span className="text-gray-300">Garantía Oficial Directa</span>
                    <span className="text-primary-soft font-bold">Auténtico 100%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controles de Navegación del Carrusel */}
      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="Banner anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-3 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white cursor-pointer active:scale-90"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M15.5 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="Banner siguiente"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-black/40 p-3 text-white/80 backdrop-blur-md transition hover:bg-white/20 hover:text-white cursor-pointer active:scale-90"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <path d="M8.5 5l7 7-7 7" />
            </svg>
          </button>

          {/* Barra de Progreso y Bullets */}
          <div className="absolute inset-x-0 bottom-4 z-20">
            <div className="container-site flex items-center justify-center gap-2.5">
              {banners.map((b, i) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => goTo(i)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    i === active
                      ? "w-10 bg-primary-light shadow-sm shadow-primary"
                      : "w-2.5 bg-white/25 hover:bg-white/50"
                  }`}
                  aria-label={`Ir al banner ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
