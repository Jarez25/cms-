"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  activeTheme: string;
}

export default function ThemeEffects({ activeTheme }: Props) {
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Efecto de nieve para Navidad en canvas
  useEffect(() => {
    if (!mounted || activeTheme !== "christmas") return;
    const canvas = canvasRef.current;
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

    const flakeCount = Math.min(Math.floor(width / 24), 55);
    const flakes = Array.from({ length: flakeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2.8 + 1,
      d: Math.random() * flakeCount,
      speed: Math.random() * 0.8 + 0.5,
      opacity: Math.random() * 0.6 + 0.25,
      wind: (Math.random() - 0.5) * 0.4,
    }));

    let angle = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angle += 0.01;

      for (let i = 0; i < flakes.length; i++) {
        const f = flakes[i];
        f.y += f.speed;
        f.x += Math.sin(angle + f.d) * 0.5 + f.wind;

        if (f.y > height) {
          f.y = -5;
          f.x = Math.random() * width;
        }
        if (f.x > width + 5) f.x = -5;
        if (f.x < -5) f.x = width + 5;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.4)";
        ctx.shadowBlur = 3;
        ctx.fill();
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
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden select-none" aria-hidden="true">
      {/* 🎄 NAVIDAD: Nieve suave */}
      {activeTheme === "christmas" && (
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
      )}

      {/* 🎃 HALLOWEEN: Telarañas sutiles en esquinas y murciélagos animados */}
      {activeTheme === "halloween" && (
        <>
          {/* Telaraña Superior Izquierda */}
          <svg
            className="absolute top-0 left-0 w-32 h-32 text-orange-500/20 md:w-44 md:h-44"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          >
            <path d="M0,0 L100,0 M0,0 L70,70 M0,0 L0,100" />
            <path d="M0,25 Q25,25 25,0" />
            <path d="M0,50 Q50,50 50,0" />
            <path d="M0,75 Q75,75 75,0" />
            <path d="M0,100 Q100,100 100,0" />
          </svg>

          {/* Telaraña Superior Derecha */}
          <svg
            className="absolute top-0 right-0 w-32 h-32 text-purple-500/20 md:w-44 md:h-44 -scale-x-100"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
          >
            <path d="M0,0 L100,0 M0,0 L70,70 M0,0 L0,100" />
            <path d="M0,25 Q25,25 25,0" />
            <path d="M0,50 Q50,50 50,0" />
            <path d="M0,75 Q75,75 75,0" />
            <path d="M0,100 Q100,100 100,0" />
          </svg>

          {/* Murciélagos animados flotando a través de la pantalla */}
          <div className="bat-flight-1 absolute top-12 -left-12 opacity-40">
            <span className="text-2xl filter drop-shadow">🦇</span>
          </div>
          <div className="bat-flight-2 absolute top-28 -left-12 opacity-30">
            <span className="text-lg filter drop-shadow">🦇</span>
          </div>
          <div className="bat-flight-3 absolute top-6 -left-12 opacity-35">
            <span className="text-xl filter drop-shadow">🦇</span>
          </div>

          <style jsx>{`
            .bat-flight-1 {
              animation: flyAcross 16s ease-in-out infinite;
            }
            .bat-flight-2 {
              animation: flyAcross 22s ease-in-out 4s infinite;
            }
            .bat-flight-3 {
              animation: flyAcross 19s ease-in-out 9s infinite;
            }
            @keyframes flyAcross {
              0% {
                transform: translateX(-50px) translateY(0px) scale(0.8);
                opacity: 0;
              }
              10% {
                opacity: 0.45;
              }
              45% {
                transform: translateX(50vw) translateY(35px) scale(1.1);
              }
              55% {
                transform: translateX(60vw) translateY(-20px) scale(1);
              }
              90% {
                opacity: 0.4;
              }
              100% {
                transform: translateX(105vw) translateY(15px) scale(0.9);
                opacity: 0;
              }
            }
          `}</style>
        </>
      )}

      {/* 💖 SAN VALENTÍN: Corazoncitos y destellos flotando hacia arriba */}
      {activeTheme === "valentine" && (
        <>
          <div className="heart-rise-1 absolute bottom-4 left-[10%] opacity-40">
            <span className="text-xl filter drop-shadow">💖</span>
          </div>
          <div className="heart-rise-2 absolute bottom-4 left-[35%] opacity-30">
            <span className="text-base filter drop-shadow">✨</span>
          </div>
          <div className="heart-rise-3 absolute bottom-4 left-[65%] opacity-35">
            <span className="text-2xl filter drop-shadow">💘</span>
          </div>
          <div className="heart-rise-4 absolute bottom-4 left-[85%] opacity-25">
            <span className="text-lg filter drop-shadow">💕</span>
          </div>

          <style jsx>{`
            .heart-rise-1 {
              animation: riseUp 12s ease-in-out infinite;
            }
            .heart-rise-2 {
              animation: riseUp 15s ease-in-out 3s infinite;
            }
            .heart-rise-3 {
              animation: riseUp 14s ease-in-out 6s infinite;
            }
            .heart-rise-4 {
              animation: riseUp 18s ease-in-out 2s infinite;
            }
            @keyframes riseUp {
              0% {
                transform: translateY(100vh) scale(0.7) rotate(-10deg);
                opacity: 0;
              }
              15% {
                opacity: 0.5;
              }
              50% {
                transform: translateY(50vh) scale(1.1) rotate(15deg);
              }
              85% {
                opacity: 0.4;
              }
              100% {
                transform: translateY(-50px) scale(0.9) rotate(-15deg);
                opacity: 0;
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}
