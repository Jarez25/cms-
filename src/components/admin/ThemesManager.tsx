"use client";

import { useState } from "react";
import { type SeasonTheme, type ThemeId } from "@/lib/theme";

interface Props {
  initialActiveTheme: string;
  themes: SeasonTheme[];
}

export default function ThemesManager({ initialActiveTheme, themes }: Props) {
  const [activeTheme, setActiveTheme] = useState<string>(initialActiveTheme);
  const [loadingTheme, setLoadingTheme] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  async function handleToggle(themeId: ThemeId) {
    if (loadingTheme) return;

    // Si ya está activo y se hace clic, volvemos a 'default' (a menos que ya sea default)
    const targetThemeId = activeTheme === themeId && themeId !== "default" ? "default" : themeId;

    setLoadingTheme(themeId);
    try {
      const res = await fetch("/api/themes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ themeId: targetThemeId }),
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el tema");
      }

      const data = await res.json();
      setActiveTheme(data.activeTheme);

      const chosen = themes.find((t) => t.id === data.activeTheme);
      showToast(
        `¡Tema "${chosen?.name || data.activeTheme}" activado exitosamente en toda la tienda!`,
        "success"
      );

      // Recargar previsualizador si existe
      window.dispatchEvent(new Event("cms:reload-preview"));
    } catch {
      showToast("Error al activar el tema. Por favor intenta de nuevo.", "error");
    } finally {
      setLoadingTheme(null);
    }
  }

  const currentTheme = themes.find((t) => t.id === activeTheme) || themes[0];

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Toast de confirmación flotante */}
      {toast && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-semibold transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-gray-900 text-white border border-gray-700 shadow-emerald-950/20"
              : "bg-red-600 text-white shadow-red-950/20"
          }`}
        >
          {toast.type === "success" ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white">
              !
            </span>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Banner de estado actual */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-8 text-white border border-gray-800 shadow-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold tracking-wide uppercase text-gray-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Tema Activo en Producción
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-3">
              <span>{currentTheme.emoji}</span>
              <span>{currentTheme.name}</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-2xl leading-relaxed">
              {currentTheme.description}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-gray-950 font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-100 transition shadow-lg active:scale-95"
            >
              <span>Ver tienda en vivo</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Barra resumen de la paleta activa */}
        <div className="mt-6 pt-6 border-t border-gray-800/80 flex flex-wrap items-center gap-4 text-xs text-gray-400">
          <span className="font-medium text-gray-300">Paleta en vivo:</span>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: currentTheme.palette.primary }}
              title={`Primario: ${currentTheme.palette.primary}`}
            />
            <span className="font-mono text-gray-300">{currentTheme.palette.primary}</span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full border border-white/20 shadow-sm"
              style={{ backgroundColor: currentTheme.palette.accent }}
              title={`Acento: ${currentTheme.palette.accent}`}
            />
            <span className="font-mono text-gray-300">{currentTheme.palette.accent}</span>
          </div>
          <span className="text-gray-600">|</span>
          <span>Efecto: <strong className="text-gray-200 capitalize">{currentTheme.effect}</strong></span>
          <span className="text-gray-600">|</span>
          <span className="italic truncate max-w-md">"{currentTheme.announcement.text}"</span>
        </div>
      </div>

      {/* Regla de negocio explicada */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/80 border border-blue-100 text-blue-900 text-sm">
        <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <strong className="font-semibold">Regla de activación exclusiva:</strong> Solo puede haber{" "}
          <span className="underline decoration-blue-400 font-bold">1 tema activo a la vez</span>. Al activar el switch de cualquier temporada, se desactivará automáticamente el tema previo y se actualizarán en milisegundos los colores primarios, degradados, efectos animados (nieve, murciélagos, corazones) y aviso superior en todo el frontend.
        </div>
      </div>

      {/* Grid de temas disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {themes.map((theme) => {
          const isActive = activeTheme === theme.id;
          const isLoading = loadingTheme === theme.id;

          return (
            <div
              key={theme.id}
              className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                isActive
                  ? "bg-white border-2 border-emerald-500 shadow-2xl shadow-emerald-500/10 ring-4 ring-emerald-500/10"
                  : "bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300"
              }`}
            >
              {/* Header de la tarjeta */}
              <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3.5">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-3xl shadow-inner border border-gray-200/60">
                      {theme.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-gray-900">{theme.name}</h3>
                        {isActive && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                            Activo
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{theme.subtitle}</p>
                    </div>
                  </div>

                  {/* Switch Toggle estilo iOS */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={isActive}
                      aria-label={`Activar tema ${theme.name}`}
                      disabled={isLoading}
                      onClick={() => handleToggle(theme.id)}
                      className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isActive
                          ? "bg-emerald-500 focus:ring-emerald-500"
                          : "bg-gray-300 hover:bg-gray-400 focus:ring-gray-400"
                      } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center text-[10px] font-bold ${
                          isActive ? "translate-x-6 text-emerald-600" : "translate-x-0 text-gray-400"
                        }`}
                      >
                        {isLoading ? (
                          <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                        ) : isActive ? (
                          "ON"
                        ) : (
                          "OFF"
                        )}
                      </span>
                    </button>
                    <span className="text-[11px] font-medium text-gray-400">
                      {isActive ? "Activo" : "Inactivo"}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-5">
                  {theme.description}
                </p>

                {/* Vista previa gráfica del tema */}
                <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 space-y-3.5 mb-5">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Simulación Visual en Tienda
                  </div>

                  {/* Barra de anuncio simulada */}
                  <div
                    className="rounded-xl px-3 py-2 text-xs font-semibold text-white flex items-center justify-between gap-2 shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${theme.palette.primary}, ${theme.palette.accent})`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold">
                        {theme.announcement.badge}
                      </span>
                      <span className="truncate">{theme.announcement.text}</span>
                    </div>
                    <span className="shrink-0 text-[10px] bg-white text-gray-900 px-2 py-0.5 rounded-full font-bold">
                      {theme.announcement.ctaText}
                    </span>
                  </div>

                  {/* Tarjeta de producto simulada */}
                  <div className="bg-white rounded-xl p-3 border border-gray-200/80 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-inner"
                        style={{ backgroundColor: theme.palette.soft }}
                      >
                        {theme.emoji}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900">Producto Especial</div>
                        <span
                          className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                          style={{
                            backgroundColor: theme.palette.soft,
                            color: theme.palette.primary,
                          }}
                        >
                          {theme.badges.product}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-black text-gray-900">S/. 199.00</div>
                      <button
                        type="button"
                        className="mt-1 px-3 py-1 rounded-lg text-[11px] font-bold text-white shadow-sm transition"
                        style={{ backgroundColor: theme.palette.primary }}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>

                  {/* Swatches de color */}
                  <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-medium text-gray-500">Muestras de color:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: theme.palette.primary }}
                        title={`Primario: ${theme.palette.primary}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: theme.palette.light }}
                        title={`Hover: ${theme.palette.light}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: theme.palette.dark }}
                        title={`Oscuro: ${theme.palette.dark}`}
                      />
                      <span
                        className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                        style={{ backgroundColor: theme.palette.accent }}
                        title={`Acento: ${theme.palette.accent}`}
                      />
                      {theme.palette.gold && (
                        <span
                          className="w-5 h-5 rounded-full border border-gray-300 shadow-sm"
                          style={{ backgroundColor: theme.palette.gold }}
                          title={`Oro festivo: ${theme.palette.gold}`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón de acción al pie de la tarjeta */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleToggle(theme.id)}
                  className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                      : "bg-gray-900 text-white hover:bg-black active:scale-[0.98] shadow-sm"
                  } ${isLoading ? "opacity-60 cursor-wait" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      <span>Aplicando tema...</span>
                    </>
                  ) : isActive ? (
                    <>
                      <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Tema Activo (Clic para desactivar)</span>
                    </>
                  ) : (
                    <>
                      <span>Activar {theme.name}</span>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
