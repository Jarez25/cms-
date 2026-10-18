"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

interface Props {
  activeTheme: string;
}

export default function ThemeEffects({ activeTheme }: Props) {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const snowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const heartsCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. 🎄 NAVIDAD: Nieve cinematográfica con copos de cristal de 6 puntas
  useEffect(() => {
    if (!mounted || activeTheme !== "christmas" || pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return;
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
  }, [mounted, activeTheme, pathname]);

  // 2. 💖 SAN VALENTÍN: Corazones y Polvo de Estrellas en Canvas
  useEffect(() => {
    if (!mounted || activeTheme !== "valentine" || pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return;
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
  }, [mounted, activeTheme, pathname]);

  // 3. 🎆 AÑO NUEVO: Fuegos Artificiales y Confeti Dorado en Canvas
  useEffect(() => {
    if (!mounted || activeTheme !== "newyear" || pathname?.startsWith("/admin") || pathname?.startsWith("/login")) return;
    const canvas = fireworksCanvasRef.current;
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

    interface FireworkParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
    }

    interface ConfettiPiece {
      x: number;
      y: number;
      w: number;
      h: number;
      vy: number;
      vx: number;
      rot: number;
      vRot: number;
      color: string;
    }

    let particles: FireworkParticle[] = [];
    const colors = ["#fbbf24", "#f59e0b", "#c084fc", "#38bdf8", "#f43f5e", "#ffffff"];
    const confettiColors = ["#fbbf24", "#f59e0b", "#eab308", "#fef08a", "#d97706"];

    const confetti: ConfettiPiece[] = Array.from({ length: 28 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      w: Math.random() * 5 + 4,
      h: Math.random() * 8 + 6,
      vy: Math.random() * 0.8 + 0.4,
      vx: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
      vRot: (Math.random() - 0.5) * 0.04,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
    }));

    const explode = (originX: number, originY: number) => {
      const pCount = Math.floor(Math.random() * 25) + 35;
      const baseColor = colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < pCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() < 0.2 ? "#ffffff" : baseColor,
          size: Math.random() * 2.2 + 1.2,
        });
      }
    };

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      // Disparar fuegos artificiales periódicamente
      if (tick % 75 === 0) {
        explode(Math.random() * (width * 0.8) + width * 0.1, Math.random() * (height * 0.45) + 80);
      }

      // Render confeti
      for (let i = 0; i < confetti.length; i++) {
        const c = confetti[i];
        c.y += c.vy;
        c.x += c.vx;
        c.rot += c.vRot;

        if (c.y > height + 10) {
          c.y = -10;
          c.x = Math.random() * width;
        }

        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
        ctx.restore();
      }

      // Render partículas de fuegos artificiales
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.035; // Gravedad suave
        p.vx *= 0.98;
        p.vy *= 0.98;
        p.alpha -= 0.015;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
    };
  }, [mounted, activeTheme, pathname]);

  // Si estamos en el panel de administración (/admin) o login, NUNCA mostrar efectos
  if (
    !mounted ||
    activeTheme === "default" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* 🎄 1. NAVIDAD MÁGICA */}
      {activeTheme === "christmas" && (
        <>
          <canvas ref={snowCanvasRef} className="absolute inset-0 pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-10 flex items-center justify-between px-2 sm:px-6 z-50 pointer-events-none overflow-hidden">
            <svg
              className="w-full h-8 text-emerald-800/40 drop-shadow-sm"
              viewBox="0 0 1200 40"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0,8 Q100,28 200,8 Q300,28 400,8 Q500,28 600,8 Q700,28 800,8 Q900,28 1000,8 Q1100,28 1200,8"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
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

          <div className="christmas-bells absolute top-4 right-4 sm:right-8 opacity-85 z-40 hidden md:block">
            <svg
              className="w-16 h-16 filter drop-shadow-md"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M50 25 C40 10 20 20 35 32 C45 40 50 35 50 35 C50 35 55 40 65 32 C80 20 60 10 50 25 Z"
                fill="#dc2626"
              />
              <circle cx="50" cy="30" r="5" fill="#f59e0b" />
              <path d="M48 35 Q38 52 30 65 Q40 60 48 42" fill="#b91c1c" />
              <path d="M52 35 Q62 52 70 65 Q60 60 52 42" fill="#b91c1c" />
              <path
                d="M32 38 C32 38 42 42 40 62 L20 64 C20 46 32 38 32 38 Z"
                fill="#f59e0b"
                stroke="#d97706"
                strokeWidth="1.5"
              />
              <ellipse cx="30" cy="63" rx="10" ry="3.5" fill="#fbbf24" stroke="#d97706" />
              <circle cx="30" cy="65" r="2.5" fill="#78350f" />
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

      {/* 🎃 2. HALLOWEEN ESPELUZNANTE */}
      {activeTheme === "halloween" && (
        <>
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
            <div className="spider-dangle absolute left-16 top-0 flex flex-col items-center">
              <div className="w-px h-16 sm:h-24 bg-gradient-to-b from-gray-400/80 to-gray-600" />
              <svg
                className="w-5 h-5 text-neutral-900 drop-shadow-sm -mt-0.5"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <ellipse cx="12" cy="14" rx="4" ry="5" />
                <circle cx="12" cy="7" r="3" />
                <path
                  d="M9 12 C4 9 4 5 1 5 M15 12 C20 9 20 5 23 5 M8 14 C3 14 2 17 0 19 M16 14 C21 14 22 17 24 19 M9 16 C5 19 4 23 2 24 M15 16 C19 19 20 23 22 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  fill="none"
                />
              </svg>
            </div>
          </div>

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

          <div className="jack-lantern absolute bottom-4 right-4 sm:right-8 z-30 hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-orange-500/30 blur-xl candle-glow" />
              <svg className="w-16 h-16 filter drop-shadow-lg" viewBox="0 0 100 100" fill="none">
                <path d="M48 18 C46 10 52 4 58 2 C58 8 54 14 52 18 Z" fill="#15803d" />
                <ellipse cx="50" cy="58" rx="42" ry="36" fill="#ea580c" />
                <ellipse cx="50" cy="58" rx="28" ry="36" fill="#f97316" />
                <ellipse cx="50" cy="58" rx="14" ry="36" fill="#fb923c" />
                <polygon points="32,45 42,48 36,36" fill="#fef08a" className="flicker-flame" />
                <polygon points="68,45 58,48 64,36" fill="#fef08a" className="flicker-flame" />
                <polygon points="50,52 46,60 54,60" fill="#fef08a" className="flicker-flame" />
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

      {/* 💖 3. SAN VALENTÍN ROMÁNTICO */}
      {activeTheme === "valentine" && (
        <>
          <canvas ref={heartsCanvasRef} className="absolute inset-0 pointer-events-none" />
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
          <div className="cupid-arrow absolute top-4 right-4 sm:right-8 opacity-85 z-40 hidden md:block">
            <svg
              className="w-14 h-14 filter drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
              viewBox="0 0 100 100"
              fill="none"
            >
              <path
                d="M50 35 C40 20 20 30 35 48 C45 60 50 68 50 68 C50 68 55 60 65 48 C80 30 60 20 50 35 Z"
                fill="url(#valGrad)"
              />
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

      {/* ⚡ 4. BLACK FRIDAY & CYBER WEEK */}
      {activeTheme === "blackfriday" && (
        <>
          {/* Relámpagos cibernéticos en esquinas */}
          <div className="absolute top-2 left-3 sm:left-8 z-40 opacity-80 animate-pulse">
            <span className="inline-flex items-center gap-1 bg-yellow-400 text-black text-[11px] font-black px-3 py-1 rounded-full shadow-lg shadow-yellow-400/30 uppercase tracking-widest border border-yellow-200">
              ⚡ BLACK FRIDAY SALE
            </span>
          </div>

          <div className="absolute top-3 right-4 sm:right-10 z-40 hidden md:block">
            <svg className="w-12 h-16 text-yellow-400 filter drop-shadow-[0_0_12px_rgba(234,179,8,0.7)] animate-bounce" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>

          {/* Badges de descuento flotantes en esquinas */}
          <div className="cyber-badge absolute bottom-6 left-6 z-30 hidden sm:block">
            <div className="bg-black/90 text-yellow-400 border border-yellow-400/60 px-3.5 py-1.5 rounded-xl shadow-xl backdrop-blur-md text-xs font-black tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
              <span>HASTA -60% OFF</span>
            </div>
          </div>
        </>
      )}

      {/* 🎆 5. AÑO NUEVO & GALA */}
      {activeTheme === "newyear" && (
        <>
          <canvas ref={fireworksCanvasRef} className="absolute inset-0 pointer-events-none" />
          {/* Copas de Champán brindando en la esquina */}
          <div className="champagne-cheers absolute top-4 right-4 sm:right-8 opacity-85 z-40 hidden md:block">
            <svg className="w-14 h-14 filter drop-shadow-md" viewBox="0 0 100 100" fill="none">
              {/* Copa izquierda */}
              <path d="M35 25 L45 55 L42 75 L30 75 M42 75 L54 75" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M25 25 Q35 55 45 55 Q55 55 65 25 Z" fill="#fef08a" opacity="0.6" stroke="#fbbf24" strokeWidth="2" />
              {/* Burbujitas de champán */}
              <circle cx="45" cy="35" r="2" fill="#ffffff" />
              <circle cx="42" cy="45" r="1.5" fill="#ffffff" />
              <circle cx="48" cy="28" r="1.8" fill="#ffffff" />
              {/* Destellos dorados */}
              <polygon points="60,18 63,24 70,25 64,29 65,36 60,31 55,36 56,29 50,25 57,24" fill="#f59e0b" />
            </svg>
          </div>
        </>
      )}

      {/* 🌴 6. VERANO & SUMMER FEST */}
      {activeTheme === "summer" && (
        <>
          {/* Sol radiante girando en esquina superior derecha */}
          <div className="absolute -top-10 -right-10 w-44 h-44 z-30 opacity-75">
            <svg className="w-full h-full text-amber-400 sun-spin" viewBox="0 0 100 100" fill="currentColor">
              <circle cx="50" cy="50" r="22" fill="#f59e0b" />
              {Array.from({ length: 12 }).map((_, i) => (
                <rect
                  key={i}
                  x="48"
                  y="12"
                  width="4"
                  height="12"
                  rx="2"
                  transform={`rotate(${i * 30} 50 50)`}
                  fill="#fbbf24"
                />
              ))}
            </svg>
          </div>

          {/* Palmera tropical en esquina inferior izquierda */}
          <div className="palm-tree absolute bottom-0 left-2 z-30 opacity-60 hidden md:block">
            <svg className="w-20 h-24 filter drop-shadow-sm" viewBox="0 0 100 120" fill="none">
              {/* Tronco */}
              <path d="M35 120 Q45 80 48 50" stroke="#78350f" strokeWidth="6" strokeLinecap="round" />
              {/* Hojas */}
              <path d="M48 50 Q20 35 10 50 Q30 45 48 50" fill="#15803d" />
              <path d="M48 50 Q40 20 30 15 Q42 30 48 50" fill="#16a34a" />
              <path d="M48 50 Q60 20 70 15 Q58 30 48 50" fill="#16a34a" />
              <path d="M48 50 Q80 35 90 50 Q70 45 48 50" fill="#15803d" />
            </svg>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* ANIMACIONES CSS OPTIMIZADAS CON GPU ACCELERATION               */}
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
        .christmas-bells {
          transform-origin: top center;
          animation: bellSwing 4s ease-in-out infinite;
        }
        @keyframes bellSwing {
          0%, 100% { transform: rotate(-7deg); }
          50% { transform: rotate(7deg); }
        }

        /* 🎃 Murciélagos */
        .bat-wing-flap {
          transform-origin: center center;
          animation: batWingFlap 0.22s ease-in-out infinite alternate;
        }
        @keyframes batWingFlap {
          0% { transform: scaleY(1); }
          100% { transform: scaleY(0.45); }
        }
        .bat-flight-1 {
          animation: flyBatPath1 15s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .bat-flight-2 {
          animation: flyBatPath2 19s cubic-bezier(0.4, 0, 0.2, 1) 4s infinite;
        }
        @keyframes flyBatPath1 {
          0% { transform: translate3d(-60px, 0, 0) scale(0.7); opacity: 0; }
          10% { opacity: 0.8; }
          50% { transform: translate3d(55vw, 60px, 0) scale(1.15); }
          90% { opacity: 0.7; }
          100% { transform: translate3d(105vw, -30px, 0) scale(0.8); opacity: 0; }
        }
        @keyframes flyBatPath2 {
          0% { transform: translate3d(-60px, 40px, 0) scale(0.65); opacity: 0; }
          15% { opacity: 0.75; }
          45% { transform: translate3d(40vw, -20px, 0) scale(1); }
          90% { opacity: 0.7; }
          100% { transform: translate3d(105vw, 50px, 0) scale(0.75); opacity: 0; }
        }

        /* 🎃 Arañita */
        .spider-dangle {
          transform-origin: top center;
          animation: spiderBob 6s ease-in-out infinite;
        }
        @keyframes spiderBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(22px); }
        }

        /* 🎃 Vela Jack-O'-Lantern */
        .flicker-flame {
          animation: flameFlicker 1.6s ease-in-out infinite alternate;
        }
        @keyframes flameFlicker {
          0%, 100% { fill: #fef08a; opacity: 0.9; }
          25% { fill: #fde047; opacity: 0.65; }
          50% { fill: #fbbf24; opacity: 1; }
          75% { fill: #f59e0b; opacity: 0.8; }
        }
        .candle-glow {
          animation: candleGlowPulse 2s ease-in-out infinite alternate;
        }
        @keyframes candleGlowPulse {
          0% { opacity: 0.3; transform: scale(0.92); }
          100% { opacity: 0.65; transform: scale(1.15); }
        }

        /* 💖 San Valentín */
        .heart-shimmer {
          animation: heartBlink 2.2s ease-in-out infinite alternate;
        }
        @keyframes heartBlink {
          0% { opacity: 0.3; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1.15); }
        }
        .cupid-arrow {
          animation: cupidFloat 3.5s ease-in-out infinite alternate;
        }
        @keyframes cupidFloat {
          0% { transform: translateY(0) rotate(-4deg); }
          100% { transform: translateY(-8px) rotate(4deg); }
        }

        /* 🎆 Año Nuevo */
        .champagne-cheers {
          animation: clinkCheers 3.2s ease-in-out infinite alternate;
        }
        @keyframes clinkCheers {
          0% { transform: rotate(-3deg) scale(0.95); }
          100% { transform: rotate(3deg) scale(1.05); }
        }

        /* 🌴 Verano */
        .sun-spin {
          transform-origin: center center;
          animation: sunRotate 36s linear infinite;
        }
        @keyframes sunRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .palm-tree {
          transform-origin: bottom center;
          animation: palmSway 5s ease-in-out infinite alternate;
        }
        @keyframes palmSway {
          0% { transform: rotate(-2deg); }
          100% { transform: rotate(3deg); }
        }
      `}</style>
    </div>
  );
}
