export interface Palette {
  primary: string;
  light: string;
  dark: string;
  soft: string;
}

export const PRESETS: Record<string, Palette> = {
  indigo: { primary: "#4f46e5", light: "#6366f1", dark: "#4338ca", soft: "#eef2ff" },
  blue: { primary: "#2563eb", light: "#3b82f6", dark: "#1d4ed8", soft: "#eff6ff" },
  violet: { primary: "#7c3aed", light: "#8b5cf6", dark: "#6d28d9", soft: "#f5f3ff" },
  emerald: { primary: "#059669", light: "#10b981", dark: "#047857", soft: "#ecfdf5" },
  teal: { primary: "#0d9488", light: "#14b8a6", dark: "#0f766e", soft: "#f0fdfa" },
  cyan: { primary: "#0891b2", light: "#06b6d4", dark: "#0e7490", soft: "#ecfeff" },
  rose: { primary: "#e11d48", light: "#f43f5e", dark: "#be123c", soft: "#fff1f2" },
  amber: { primary: "#d97706", light: "#f59e0b", dark: "#b45309", soft: "#fffbeb" },
  slate: { primary: "#475569", light: "#64748b", dark: "#334155", soft: "#f1f5f9" },
};

export const PRESET_NAMES = Object.keys(PRESETS);

export type ThemeId = "default" | "halloween" | "christmas" | "valentine";

export interface SeasonTheme {
  id: ThemeId;
  name: string;
  subtitle: string;
  description: string;
  icon: string;
  emoji: string;
  previewBg: string;
  previewGradients: string;
  palette: {
    primary: string;
    light: string;
    dark: string;
    soft: string;
    accent: string;
    gold?: string;
    glow: string;
  };
  announcement: {
    badge: string;
    text: string;
    ctaText: string;
    ctaLink: string;
  };
  badges: {
    product: string;
    banner: string;
  };
  effect: "none" | "halloween" | "christmas" | "valentine";
}

export const SEASON_THEMES: Record<ThemeId, SeasonTheme> = {
  default: {
    id: "default",
    name: "Clásico / Nova Tech",
    subtitle: "Diseño Corporativo & Moderno",
    description: "Estética tecnológica limpia con tonos azul eléctrico e índigo. Ideal para operación regular durante todo el año.",
    icon: "⚡",
    emoji: "⚡",
    previewBg: "from-slate-900 via-indigo-950 to-slate-900",
    previewGradients: "from-blue-600 to-indigo-600",
    palette: {
      primary: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
      soft: "#eff6ff",
      accent: "#06b6d4",
      glow: "rgba(37, 99, 235, 0.35)",
    },
    announcement: {
      badge: "OFICIAL",
      text: "🚀 Envíos gratis a todo el país en pedidos seleccionados · Garantía oficial de 12 meses",
      ctaText: "Ver tienda",
      ctaLink: "/tienda",
    },
    badges: {
      product: "⚡ Destacado",
      banner: "TECH FLAGSHIP",
    },
    effect: "none",
  },
  halloween: {
    id: "halloween",
    name: "Halloween Espeluznante",
    subtitle: "Noche de Brujas & Ofertas de Miedo",
    description: "Atmósfera nocturna con naranja calabaza, morado hechicero, murciélagos flotantes y detalles de noche de brujas.",
    icon: "🎃",
    emoji: "🎃",
    previewBg: "from-neutral-950 via-purple-950 to-orange-950",
    previewGradients: "from-orange-500 via-amber-600 to-purple-700",
    palette: {
      primary: "#ea580c",
      light: "#f97316",
      dark: "#9a3412",
      soft: "#fff7ed",
      accent: "#9333ea",
      glow: "rgba(234, 88, 12, 0.45)",
    },
    announcement: {
      badge: "🎃 HALLOWEEN",
      text: "🎃 ¡Especial Noche de Brujas! Ofertas espeluznantes y regalos sorpresa en compras seleccionadas 👻",
      ctaText: "Ver ofertas",
      ctaLink: "/tienda",
    },
    badges: {
      product: "🎃 Oferta Embrujada",
      banner: "ESPECIAL HALLOWEEN",
    },
    effect: "halloween",
  },
  christmas: {
    id: "christmas",
    name: "Navidad Mágica",
    subtitle: "Fiestas & Temporada Navideña",
    description: "Espíritu festivo con rojo carmesí, verde abeto, acentos de oro resplandeciente y suave nevada animada.",
    icon: "🎄",
    emoji: "🎄",
    previewBg: "from-red-950 via-neutral-900 to-emerald-950",
    previewGradients: "from-red-600 via-emerald-600 to-amber-500",
    palette: {
      primary: "#dc2626",
      light: "#ef4444",
      dark: "#991b1b",
      soft: "#fef2f2",
      accent: "#15803d",
      gold: "#eab308",
      glow: "rgba(220, 38, 38, 0.45)",
    },
    announcement: {
      badge: "🎄 NAVIDAD",
      text: "🎄 ¡Temporada Navideña! El regalo perfecto con empaque festivo y entrega garantizada 🎁",
      ctaText: "Comprar regalos",
      ctaLink: "/tienda",
    },
    badges: {
      product: "🎁 Regalo Navideño",
      banner: "EDICIÓN NAVIDEÑA",
    },
    effect: "christmas",
  },
  valentine: {
    id: "valentine",
    name: "San Valentín Romántico",
    subtitle: "Amor & Amistad",
    description: "Elegancia romántica con rojo pasión, rosa pétalo, acentos dorados y pequeños corazones flotantes sutiles.",
    icon: "💖",
    emoji: "💖",
    previewBg: "from-pink-950 via-rose-950 to-neutral-900",
    previewGradients: "from-rose-500 via-pink-600 to-purple-600",
    palette: {
      primary: "#e11d48",
      light: "#f43f5e",
      dark: "#9f1239",
      soft: "#fff1f2",
      accent: "#ec4899",
      gold: "#f59e0b",
      glow: "rgba(225, 29, 72, 0.45)",
    },
    announcement: {
      badge: "💖 SAN VALENTÍN",
      text: "💖 ¡Mes del Amor y la Amistad! Sorprende a esa persona especial con los mejores combos y detalles 💘",
      ctaText: "Ver regalos",
      ctaLink: "/tienda",
    },
    badges: {
      product: "💘 Especial San Valentín",
      banner: "EDICIÓN AMOR & AMISTAD",
    },
    effect: "valentine",
  },
};

export const THEME_LIST = Object.values(SEASON_THEMES);

export function getSeasonTheme(id?: string | null): SeasonTheme {
  if (!id || !(id in SEASON_THEMES)) {
    return SEASON_THEMES.default;
  }
  return SEASON_THEMES[id as ThemeId];
}
