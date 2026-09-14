"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

const DURATION = 7000;

function positionStyle(pos: string): React.CSSProperties {
  if (pos === "center") {
    return {
      left: "50%",
      top: "50%",
      transform: "translate(-50%, -50%)",
      textAlign: "center",
      justifyContent: "center",
    };
  }
  if (pos === "right") {
    return {
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      textAlign: "right",
      justifyContent: "flex-end",
    };
  }
  return {
    left: 0,
    top: "50%",
    transform: "translateY(-50%)",
    textAlign: "left",
    justifyContent: "flex-start",
  };
}

export default function BannerSlider({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const remaining = useRef(DURATION);
  const touchX = useRef<number | null>(null);

  const count = banners.length;
  const active = count === 0 ? 0 : Math.min(index, count - 1);

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goTo(active - 1);
      if (e.key === "ArrowRight") goTo(active + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, active, goTo]);

  if (count === 0) return null;
  const current = banners[active];
  const textStyle = positionStyle(current.text_position);
  const imageStyle = positionStyle(current.image_position);

  return (
    <section
      className="relative h-[520px] md:h-[620px] overflow-hidden bg-gray-950 text-white select-none"
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
      {/* Fondo con degradado de marca */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black" />
      <div className="absolute -top-24 -left-24 h-[26rem] w-[26rem] rounded-full bg-primary/30 blur-[100px] animate-pulse" />
      <div className="absolute -bottom-32 -right-16 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[120px]" />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

      {/* Contenido activo (texto + foto de producto posicionados) */}
      <div className="container-site relative z-10 h-full">
        <div
          key={current.id}
          className="absolute max-w-xl lg:max-w-2xl"
          style={textStyle}
        >
          <div
            className="banner-animate flex items-center gap-3"
            style={{ justifyContent: textStyle.justifyContent }}
          >
            <span className="h-px w-10 bg-gradient-to-r from-transparent to-primary-light" />
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-light opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-light" />
              </span>
              Destacado
            </span>
          </div>

          <h1
            className="banner-animate mt-6 text-4xl font-extrabold leading-[1.04] tracking-tight text-balance md:text-6xl [text-shadow:0_2px_30px_rgba(0,0,0,0.55)]"
            style={{ animationDelay: "80ms" }}
          >
            {current.title}
          </h1>

          {current.subtitle && (
            <p
              className="banner-animate mt-5 max-w-xl text-lg leading-relaxed text-gray-300 md:text-xl"
              style={{ animationDelay: "160ms" }}
            >
              {current.subtitle}
            </p>
          )}

          {current.button_text && (
            <div className="banner-animate mt-9" style={{ animationDelay: "240ms" }}>
              <a
                href={current.button_link || "#"}
                className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-light to-primary px-7 py-3.5 font-semibold text-white shadow-xl shadow-primary/30 ring-1 ring-white/20 transition-all duration-300 hover:shadow-primary/50 hover:brightness-110"
              >
                {current.button_text}
                <span
                  aria-hidden
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </a>
            </div>
          )}
        </div>

        {current.image && (
          <div
            key={`img-${current.id}`}
            className="absolute z-0 pointer-events-none"
            style={imageStyle}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.image}
              alt={current.title}
              className="banner-animate h-[360px] md:h-[480px] w-auto max-w-[90vw] object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.55)]"
            />
          </div>
        )}
      </div>

      {count > 1 && (
        <>
          <button
            onClick={() => goTo(active - 1)}
            aria-label="Banner anterior"
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white/80 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
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
            onClick={() => goTo(active + 1)}
            aria-label="Banner siguiente"
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/15 bg-white/10 p-3 text-white/80 backdrop-blur-md transition hover:bg-white/25 hover:text-white"
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

          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="container-site flex items-center justify-between pb-5">
              <div className="flex items-center gap-2">
                {banners.map((b, i) => (
                  <button
                    key={b.id}
                    onClick={() => goTo(i)}
                    aria-label={`Ir al banner ${i + 1}`}
                    aria-current={i === active}
                    title={b.title}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-8 bg-gradient-to-r from-primary-light to-primary shadow-[0_0_10px_var(--primary)]"
                        : "w-4 bg-white/40 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>
              <span className="hidden text-xs font-medium tabular-nums tracking-widest text-white/60 sm:block">
                {String(active + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="h-0.5 w-full bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-primary-light to-primary transition-[width] duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      )}
    </section>
  );
}
