"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  activeTheme: string;
}

export default function ThemeEffects({ activeTheme }: Props) {
  const [mounted, setMounted] = useState(false);
  const snowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heartsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 🎄 NAVIDAD: Nieve cinematográfica con copos de cristal de 6 puntas
  useEffect(() => {
    if (!mounted || activeTheme !== "christmas") return;
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Función para dibujar copo geométrico de 6 puntas
    const drawCrystalFlake = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      radius: number,
      rot: number,
      opacity: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
      c.lineWidth = Math.max(1, radius * 0.22);
      c.beginPath();
      for (let i = 0; i < 6; i++) {
        c.moveTo(0, 0);
        c.lineTo(0, -radius);
        // Ramitas laterales
        c.moveTo(0, -radius * 0.55);
        c.lineTo(-radius * 0.28, -radius * 0.75);
        c.moveTo(0, -radius * 0.55);
        c.lineTo(radius * 0.28, -radius * 0.75);
        c.rotate(Math.PI / 3);
      }
      c.stroke();
      c.restore();
    };

    const count = Math.min(Math.floor(width / 20), 65);
    const flakes = Array.from({ length: count }, () => {
      const isCrystal = Math.random() < 0.28;
      const size = isCrystal ? Math.random() * 5 + 4 : Math.random() * 2.8 + 1;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: size,
        isCrystal,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.02,
        speed: isCrystal ? Math.random() * 0.9 + 0.6 : Math.random() * 0.7 + 0.35,
        opacity: isCrystal ? Math.random() * 0.5 + 0.45 : Math.random() * 0.6 + 0.2,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.008,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.speed;
        f.swing += f.swingSpeed;
        f.x += Math.sin(f.swing) * 0.75;
        f.rotation += f.rotSpeed;

        if (f.y > height + 10) {
          f.y = -10;
          f.x = Math.random() * width;
        }
        if (f.x > width + 10) f.x = -10;
        if (f.x < -10) f.x = width + 10;

        if (f.isCrystal) {
          drawCrystalFlake(ctx, f.x, f.y, f.r, f.rotation, f.opacity);
        } else {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
          ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
          ctx.shadowBlur = 3;
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, activeTheme]);

  // 2. 💖 SAN VALENTÍN: Partículas de Corazones y Polvo de Estrellas en Canvas
  useEffect(() => {
    if (!mounted || activeTheme !== "valentine") return;
    const canvas = heartsCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize);

    // Dibujar corazón vectorial en canvas
    const drawHeart = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rot: number,
      color: string,
      opacity: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.scale(size / 15, size / 15);
      c.globalAlpha = opacity;
      c.fillStyle = color;
      c.shadowColor = color;
      c.shadowBlur = 8;
      c.beginPath();
      c.moveTo(0, 0);
      c.bezierCurveTo(-5, -7, -12, -2, -12, 4);
      c.bezierCurveTo(-12, 10, -5, 14, 0, 19);
      c.bezierCurveTo(5, 14, 12, 10, 12, 4);
      c.bezierCurveTo(12, -2, 5, -7, 0, 0);
      c.fill();
      c.restore();
    };

    // Dibujar estrella brillante de 4 puntas
    const drawSparkle = (
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      size: number,
      rot: number,
      opacity: number
    ) => {
      c.save();
      c.translate(x, y);
      c.rotate(rot);
      c.globalAlpha = opacity;
      c.fillStyle = "#fbbf24";
      c.shadowColor = "#f59e0b";
      c.shadowBlur = 6;
      c.beginPath();
      c.moveTo(0, -size);
      c.quadraticCurveTo(0, 0, size, 0);
      c.quadraticCurveTo(0, 0, 0, size);
      c.quadraticCurveTo(0, 0, -size, 0);
      c.quadraticCurveTo(0, 0, 0, -size);
      c.fill();
      c.restore();
    };

    const heartColors = ["#f43f5e", "#fb7185", "#ec4899", "#fda4af", "#e11d48"];
    const count = Math.min(Math.floor(width / 32), 35);

    const particles = Array.from({ length: count }, () => {
      const isSparkle = Math.random() < 0.35;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: isSparkle ? Math.random() * 5 + 3 : Math.random() * 10 + 6,
        isSparkle,
        color: heartColors[Math.floor(Math.random() * heartColors.length)],
        rotation: (Math.random() - 0.5) * 0.6,
        rotSpeed: (Math.random() - 0.5) * 0.015,
        speed: isSparkle ? Math.random() * 0.7 + 0.3 : Math.random() * 0.9 + 0.4,
        opacity: Math.random() * 0.45 + 0.3,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.008,
      };
    });

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y -= p.speed;
        p.swing += p.swingSpeed;
        p.x += Math.sin(p.swing) * 0.6;
        p.rotation += p.rotSpeed;

        if (p.y < -20) {
          p.y = height + 15;
          p.x = Math.random() * width;
        }

        if (p.isSparkle) {
          drawSparkle(ctx, p.x, p.y, p.size, p.rotation, p.opacity);
        } else {
          drawHeart(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, activeTheme]);

  if (!mounted || activeTheme === "default") return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* ============================================================== */}
      {/* 🎄 1. NAVIDAD MÁGICA: Nieve, Guirnalda de Luces y Campanitas  */}
      {/* ============================================================== */}
      {activeTheme === "christmas" && (
        <>
          {/* Lienzo de nieve con copos cristalinos */}
          <canvas ref={snowCanvasRef} className="absolute inset-0 pointer-events-none" />

          {/* Guirnalda de Luces Navideñas Colgantes en el Header */}
          <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-2 sm:px-6 z-50 pointer-events-none overflow-hidden">
            <svg
              className="w-full h-8 text-emerald-800/40 drop-shadow-sm"
              viewBox="0 0 1200 40"
              fill="none"
              preserveAspectRatio="none"
            >
              {/* Cable verde de luces */}
              <path
                d="M0,8 Q100,28 200,8 Q300,28 400,8 Q500,28 600,8 Q700,28 800,8 Q900,28 1000,8 Q1100,28 1200,8"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
            {/* Bombillos de colores colgantes con parpadeo suave */}
            <div className="absolute inset-0 flex justify-around items-start pt-2 px-4">
              {[
                { color: "bg-red-500 shadow-red-500/70", delay: "0s" },
                { color: "bg-emerald-400 shadow-emerald-400/70", delay: "0.6s" },
                { color: "bg-amber-400 shadow-amber-400/70", delay: "1.2s" },
                { color: "bg-cyan-400 shadow-cyan-400/70", delay: "0.3s" },
                { color: "bg-red-500 shadow-red-500/70", delay: "0.9s" },
                { color: "bg-emerald-400 shadow-emerald-400/70", delay: "1.5s" },
                { color: "bg-amber-400 shadow-amber-400/70", delay: "0.4s" },
                { color: "bg-cyan-400 shadow-cyan-400/70", delay: "1.1s" },
                { color: "bg-red-500 shadow-red-500/70", delay: "0.7s" },
                { color: "bg-emerald-400 shadow-emerald-400/70", delay: "1.3s" },
                { color: "bg-amber-400 shadow-amber-400/70", delay: "0.2s" },
                { color: "bg-cyan-400 shadow-cyan-400/70", delay: "1.0s" },
              ].map((light, idx) => (
                <div
                  key={idx}
                  className="holiday-light flex flex-col items-center"
                  style={{ animationDelay: light.delay }}
                >
                  <div className="w-1.5 h-1.5 bg-gray-700 rounded-t-xs" />
                  <div
                    className={`w-3 h-4.5 rounded-full ${light.color} shadow-lg transition-transform duration-300`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Campanitas Navideñas en la Esquina Superior Derecha con Balanceo */}
          <div className="christmas-bells absolute top-4 right-4 sm:right-8 opacity-85 z-40 hidden md:block">
            <svg
              className="w-16 h-16 filter drop-shadow-md"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Lazo rojo festivo */}
              <path
                d="M50 25 C40 10 20 20 35 32 C45 40 50 35 50 35 C50 35 55 40 65 32 C80 20 60 10 50 25 Z"
                fill="#dc2626"
              />
              <circle cx="50" cy="30" r="5" fill="#f59e0b" />
              {/* Cinta colgante */}
              <path
                d="M48 35 Q38 52 30 65 Q40 60 48 42"
                fill="#b91c1c"
              />
              <path
                d="M52 35 Q62 52 70 65 Q60 60 52 42"
                fill="#b91c1c"
              />
              {/* Campana izquierda */}
              <path
                d="M32 38 C32 38 42 42 40 62 L20 64 C20 46 32 38 32 38 Z"
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <ellipse cx="30" cy="63" rx="10" ry="3.5" fill="#fbbf24" stroke="#d97706" />
              <circle cx="30" cy="65" r="2.5" fill="#78350f" />
              {/* Campana derecha */}
              <path
                d="M68 38 C68 38 58 42 60 62 L80 64 C80 46 68 38 68 38 Z"
                fill="#fbbf24"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <ellipse cx="70" cy="63" rx="10" ry="3.5" fill="#fde68a" stroke="#d97706" />
              <circle cx="70" cy="65" r="2.5" fill="#78350f" />
            </svg>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 🎃 2. HALLOWEEN: Murciélagos, Jack-O'-Lantern, Telaraña y Araña*/}
      {/* ============================================================== */}
      {activeTheme === "halloween" && (
        <>
          {/* Telaraña Superior Izquierda con Arañita Colgante */}
          <div className="absolute top-0 left-0 w-36 h-36 md:w-52 md:h-52 z-30">
            <svg
              className="w-full h-full text-orange-500/25"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L40,90 M0,0 L0,100" />
              <path d="M0,18 Q16,16 18,0" />
              <path d="M0,36 Q34,34 36,0" />
              <path d="M0,54 Q50,50 54,0" />
              <path d="M0,72 Q68,68 72,0" />
              <path d="M0,90 Q85,85 90,0" />
            </svg>

            {/* Hilo y Arañita que sube y baja */}
            <div className="spider-dangle absolute left-16 top-0 flex flex-col items-center">
              <div className="w-px h-16 sm:h-24 bg-gradient-to-b from-gray-400/80 to-gray-600" />
              <svg
                className="w-5 h-5 text-neutral-900 drop-shadow-sm -mt-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                {/* Cuerpo araña */}
                <ellipse cx="12" cy="14" rx="4" ry="5" />
                <circle cx="12" cy="7" r="3" />
                {/* Patas */}
                <path
                  d="M9 12 C4 9 4 5 1 5 M15 12 C20 9 20 5 23 5 M8 14 C3 14 2 17 0 19 M16 14 C21 14 22 17 24 19 M9 16 C5 19 4 23 2 24 M15 16 C19 19 20 23 22 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          {/* Telaraña Superior Derecha */}
          <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 z-30 -scale-x-100">
            <svg
              className="w-full h-full text-purple-500/25"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            >
              <path d="M0,0 L100,0 M0,0 L85,45 M0,0 L65,75 M0,0 L40,90 M0,0 L0,100" />
              <path d="M0,20 Q18,18 20,0" />
              <path d="M0,40 Q38,38 40,0" />
              <path d="M0,60 Q58,58 60,0" />
              <path d="M0,80 Q78,78 80,0" />
            </svg>
          </div>

          {/* Murciélagos Vectoriales con Aleteo Real en Bandada */}
          <div className="bat-flight-1 absolute top-14 -left-16 z-30">
            <svg
              className="w-10 h-7 text-neutral-900 drop-shadow-lg bat-wing-flap"
              viewBox="0 0 64 40"
              fill="currentColor"
            >
              <path d="M32 15 C26 5 14 0 0 6 C6 18 14 26 24 22 C26 28 30 32 32 36 C34 32 38 28 40 22 C50 26 58 18 64 6 C50 0 38 5 32 15 Z" />
            </svg>
          </div>

          <div className="bat-flight-2 absolute top-28 -left-16 z-30">
            <svg
              className="w-8 h-5 text-neutral-900/90 drop-shadow-md bat-wing-flap"
              viewBox="0 0 64 40"
              fill="currentColor"
            >
              <path d="M32 15 C26 5 14 0 0 6 C6 18 14 26 24 22 C26 28 30 32 32 36 C34 32 38 28 40 22 C50 26 58 18 64 6 C50 0 38 5 32 15 Z" />
            </svg>
          </div>

          <div className="bat-flight-3 absolute top-6 -left-16 z-30">
            <svg
              className="w-12 h-8 text-neutral-950 drop-shadow-lg bat-wing-flap"
              viewBox="0 0 64 40"
              fill="currentColor"
            >
              <path d="M32 15 C26 5 14 0 0 6 C6 18 14 26 24 22 C26 28 30 32 32 36 C34 32 38 28 40 22 C50 26 58 18 64 6 C50 0 38 5 32 15 Z" />
            </svg>
          </div>

          {/* Fantasmita Flotante Translúcido */}
          <div className="ghost-float absolute top-1/3 -right-20 z-30 hidden sm:block">
            <svg
              className="w-14 h-16 text-white/80 filter drop-shadow-[0_0_12px_rgba(168,85,247,0.5)]"
              viewBox="0 0 64 80"
              fill="currentColor"
            >
              <path d="M32 4 C16 4 8 18 8 36 C8 58 12 72 18 68 C24 64 28 72 32 68 C36 64 40 72 46 68 C52 72 56 58 56 36 C56 18 48 4 32 4 Z" />
              {/* Ojos y boca */}
              <ellipse cx="24" cy="30" rx="3" ry="5" fill="#1e1b4b" />
              <ellipse cx="40" cy="30" rx="3" ry="5" fill="#1e1b4b" />
              <ellipse cx="32" cy="42" rx="4" ry="6" fill="#1e1b4b" />
            </svg>
          </div>

          {/* Calabaza Jack-O'-Lantern Animada en Esquina Inferior Derecha */}
          <div className="jack-lantern absolute bottom-4 right-4 sm:right-8 z-30 hidden md:block">
            <div className="relative">
              {/* Aura de vela parpadeante */}
              <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-xl candle-glow" />
              <svg
                className="w-16 h-16 filter drop-shadow-lg"
                viewBox="0 0 100 100"
                fill="none"
              >
                {/* Tallo */}
                <path d="M48 18 C46 10 52 4 58 2 C58 8 54 14 52 18 Z" fill="#15803d" />
                {/* Cuerpo calabaza */}
                <ellipse cx="50" cy="58" rx="42" ry="36" fill="#ea580c" />
                <ellipse cx="50" cy="58" rx="28" ry="36" fill="#f97316" />
                <ellipse cx="50" cy="58" rx="14" ry="36" fill="#fb923c" />
                {/* Ojos y nariz tallados con vela encendida */}
                <polygon points="32,45 42,48 36,36" fill="#fef08a" className="flicker-flame" />
                <polygon points="68,45 58,48 64,36" fill="#fef08a" className="flicker-flame" />
                <polygon points="50,52 46,60 54,60" fill="#fef08a" className="flicker-flame" />
                {/* Sonrisa siniestra */}
                <path
                  d="M26 68 Q50 86 74 68 Q64 74 58 68 Q54 74 50 68 Q46 74 42 68 Q36 74 26 68 Z"
                  fill="#fef08a"
                  className="flicker-flame"
                />
              </svg>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 💖 3. SAN VALENTÍN: Corazones, Ribete de Amor y Destellos     */}
      {/* ============================================================== */}
      {activeTheme === "valentine" && (
        <>
          {/* Lienzo de corazones y estrellas en ascenso */}
          <canvas ref={heartsCanvasRef} className="absolute inset-0 pointer-events-none" />

          {/* Ribete Romántico de Corazoncitos en el Header */}
          <div className="absolute top-0 left-0 right-0 h-4 flex items-center justify-around px-4 z-40 opacity-70">
            {Array.from({ length: 16 }).map((_, i) => (
              <span
                key={i}
                className="text-xs text-rose-500/80 filter drop-shadow heart-shimmer"
                style={{ animationDelay: `${i * 0.18}s` }}
              >
                ♥
              </span>
            ))}
          </div>

          {/* Lazo de Amor con Flecha de Cupido en Esquina Superior Derecha */}
          <div className="cupid-arrow absolute top-4 right-4 sm:right-8 opacity-85 z-40 hidden md:block">
            <svg
              className="w-14 h-14 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Corazón dorado y rubí con alas */}
              <path
                d="M50 35 C40 20 20 30 35 48 C45 60 50 68 50 68 C50 68 55 60 65 48 C80 30 60 20 50 35 Z"
                fill="url(#valGrad)"
              />
              {/* Flecha dorada atravesando */}
              <line
                x1="18"
                y1="82"
                x2="82"
                y2="18"
                stroke="#fbbf24"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <polygon points="82,18 70,22 78,30" fill="#fbbf24" />
              <polygon points="18,82 28,78 22,72" fill="#fbbf24" />
              <defs>
                <linearGradient id="valGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* ANIMACIONES CSS OPTIMIZADAS CON HARDWARE ACCELERATION          */}
      {/* ============================================================== */}
      <style jsx>{`
        /* 🎄 Luces Navideñas */
        .holiday-light {
          animation: twinkleLight 1.8s ease-in-out infinite alternate;
        }
        @keyframes twinkleLight {
          0% {
            opacity: 0.35;
            filter: brightness(0.7);
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            filter: brightness(1.35) drop-shadow(0 0 8px currentColor);
            transform: scale(1.08);
          }
        }
        /* 🎄 Campanitas Balanceándose */
        .christmas-bells {
          transform-origin: top center;
          animation: bellSwing 4s ease-in-out infinite;
        }
        @keyframes bellSwing {
          0%,
          100% {
            transform: rotate(-7deg);
          }
          50% {
            transform: rotate(7deg);
          }
        }

        /* 🎃 Murciélagos: Aleteo de alas y vuelo en curva */
        .bat-wing-flap {
          transform-origin: center center;
          animation: batWingFlap 0.22s ease-in-out infinite alternate;
        }
        @keyframes batWingFlap {
          0% {
            transform: scaleY(1);
          }
          100% {
            transform: scaleY(0.45);
          }
        }
        .bat-flight-1 {
          animation: flyBatPath1 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bat-flight-2 {
          animation: flyBatPath2 19s cubic-bezier(0.4, 0, 0.2, 1) 4s infinite;
        }
        .bat-flight-3 {
          animation: flyBatPath3 17s cubic-bezier(0.4, 0, 0.2, 1) 8s infinite;
        }
        @keyframes flyBatPath1 {
          0% {
            transform: translate3d(-60px, 0, 0) scale(0.7);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          50% {
            transform: translate3d(55vw, 60px, 0) scale(1.15);
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(105vw, -30px, 0) scale(0.8);
            opacity: 0;
          }
        }
        @keyframes flyBatPath2 {
          0% {
            transform: translate3d(-60px, 40px, 0) scale(0.65);
            opacity: 0;
          }
          15% {
            opacity: 0.75;
          }
          45% {
            transform: translate3d(40vw, -20px, 0) scale(1);
          }
          90% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(105vw, 50px, 0) scale(0.75);
            opacity: 0;
          }
        }
        @keyframes flyBatPath3 {
          0% {
            transform: translate3d(-60px, -20px, 0) scale(0.85);
            opacity: 0;
          }
          12% {
            opacity: 0.85;
          }
          55% {
            transform: translate3d(65vw, 40px, 0) scale(1.2);
          }
          88% {
            opacity: 0.7;
          }
          100% {
            transform: translate3d(105vw, 10px, 0) scale(0.9);
            opacity: 0;
          }
        }

        /* 🎃 Arañita colgante */
        .spider-dangle {
          transform-origin: top center;
          animation: spiderBob 6s ease-in-out infinite;
        }
        @keyframes spiderBob {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(22px);
          }
        }

        /* 🎃 Fantasmita flotando */
        .ghost-float {
          animation: ghostDrift 20s ease-in-out infinite;
        }
        @keyframes ghostDrift {
          0% {
            transform: translate3d(80px, 0, 0);
            opacity: 0;
          }
          20% {
            opacity: 0.75;
          }
          50% {
            transform: translate3d(-40vw, -40px, 0);
            opacity: 0.85;
          }
          80% {
            opacity: 0.6;
          }
          100% {
            transform: translate3d(-105vw, 20px, 0);
            opacity: 0;
          }
        }

        /* 🎃 Vela Jack-O'-Lantern parpadeante */
        .flicker-flame {
          animation: flameFlicker 1.6s ease-in-out infinite alternate;
        }
        @keyframes flameFlicker {
          0%,
          100% {
            fill: #fef08a;
            opacity: 0.9;
          }
          25% {
            fill: #fde047;
            opacity: 0.65;
          }
          50% {
            fill: #fbbf24;
            opacity: 1;
          }
          75% {
            fill: #f59e0b;
            opacity: 0.8;
          }
        }
        .candle-glow {
          animation: candleGlowPulse 2s ease-in-out infinite alternate;
        }
        @keyframes candleGlowPulse {
          0% {
            opacity: 0.3;
            transform: scale(0.92);
          }
          100% {
            opacity: 0.65;
            transform: scale(1.15);
          }
        }

        /* 💖 San Valentín: Shimmer de Corazones y Cupido */
        .heart-shimmer {
          animation: heartBlink 2.2s ease-in-out infinite alternate;
        }
        @keyframes heartBlink {
          0% {
            opacity: 0.3;
            transform: scale(0.85);
          }
          100% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        .cupid-arrow {
          animation: cupidFloat 3.5s ease-in-out infinite alternate;
        }
        @keyframes cupidFloat {
          0% {
            transform: translateY(0) rotate(-4deg);
          }
          100% {
            transform: translateY(-8px) rotate(4deg);
          }
        }
      `}</style>
    </div>
  );
}
