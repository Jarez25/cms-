"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getSeasonTheme } from "@/lib/theme";

interface Props {
  activeTheme: string;
}

export default function SeasonalAnnouncementBar({ activeTheme }: Props) {
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    const key = `cms_dismiss_theme_${activeTheme}`;
    if (sessionStorage.getItem(key) === "1") {
      setDismissed(true);
    }
  }, [activeTheme]);

  // NUNCA mostrar la barra de anuncios en el panel de administración ni en login
  if (
    !mounted ||
    dismissed ||
    activeTheme === "default" ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/login")
  ) {
    return null;
  }

  const theme = getSeasonTheme(activeTheme);

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem(`cms_dismiss_theme_${activeTheme}`, "1");
  };

  const gradients: Record<string, string> = {
    halloween:
      "from-orange-600 via-purple-700 to-amber-600 border-b border-orange-400/40 text-white shadow-lg shadow-orange-950/20",
    christmas:
      "from-red-600 via-emerald-700 to-amber-500 border-b border-amber-300/40 text-white shadow-lg shadow-red-950/20",
    valentine:
      "from-rose-600 via-pink-600 to-amber-500 border-b border-rose-300/40 text-white shadow-lg shadow-rose-950/20",
    blackfriday:
      "from-zinc-950 via-yellow-600 to-black border-b border-yellow-400/40 text-white shadow-lg shadow-yellow-950/20",
    newyear:
      "from-slate-950 via-amber-600 to-purple-950 border-b border-amber-300/40 text-white shadow-lg shadow-amber-950/20",
    summer:
      "from-sky-600 via-teal-600 to-amber-500 border-b border-amber-300/40 text-white shadow-lg shadow-sky-950/20",
  };

  const bgClass = gradients[activeTheme] || "from-blue-600 to-indigo-700 text-white";

  return (
    <aside
      aria-label="Anuncio de temporada"
      className={`relative z-50 bg-gradient-to-r ${bgClass} py-2.5 px-3 text-xs md:text-sm font-medium shadow-md transition-all duration-300`}
    >
      <div className="container-site flex items-center justify-between gap-3">
        <div className="flex-1 flex items-center justify-center gap-2.5 text-center flex-wrap">
          <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase shadow-inner border border-white/20 animate-pulse">
            {theme.announcement.badge}
          </span>
          <span className="font-bold tracking-tight text-white drop-shadow-xs line-clamp-1">
            {theme.announcement.text}
          </span>
          <Link
            href={theme.announcement.ctaLink}
            className="hidden sm:inline-flex items-center gap-1.5 bg-white text-gray-950 font-extrabold px-3.5 py-1 rounded-full text-xs hover:bg-amber-100 hover:scale-105 active:scale-95 transition-all shadow-md ml-1"
          >
            <span>{theme.announcement.ctaText}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        <button
          onClick={dismiss}
          aria-label="Cerrar aviso"
          className="p-1 rounded-full hover:bg-black/15 transition-colors opacity-80 hover:opacity-100"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
