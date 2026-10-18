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

export type ThemeId =
  | "default"
  | "halloween"
  | "christmas"
  | "valentine"
  | "blackfriday"
  | "newyear"
  | "summer";

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
  effect: "none" | "halloween" | "christmas" | "valentine" | "blackfriday" | "newyear" | "summer";
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
    description: "Atmósfera nocturna vibrante con naranja fuego calabaza, morado hechicero, murciélagos con aleteo real, arañitas en telaraña y Jack-O'-Lantern resplandeciente.",
    icon: "🎃",
    emoji: "🎃",
    previewBg: "from-neutral-950 via-purple-950 to-orange-950",
    previewGradients: "from-orange-500 via-purple-600 to-amber-500",
    palette: {
      primary: "#ea580c",
      light: "#fb923c",
      dark: "#7c2d12",
      soft: "#fff7ed",
      accent: "#9333ea",
      gold: "#f59e0b",
      glow: "rgba(234, 88, 12, 0.6)",
    },
    announcement: {
      badge: "🎃 HALLOWEEN",
      text: "🎃 ¡Especial Noche de Brujas! Ofertas espeluznantes, descuentos de miedo y regalos sorpresa 👻",
      ctaText: "Ver ofertas de miedo",
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
    subtitle: "Fiestas, Regalos & Temporada Navideña",
    description: "Espíritu festivo resplandeciente con rojo rubí festivo, verde pino esmeralda, guirnalda de luces titilantes, copos de cristal animados y campanitas navideñas.",
    icon: "🎄",
    emoji: "🎄",
    previewBg: "from-red-950 via-neutral-900 to-emerald-950",
    previewGradients: "from-red-600 via-emerald-600 to-amber-400",
    palette: {
      primary: "#dc2626",
      light: "#f87171",
      dark: "#991b1b",
      soft: "#fef2f2",
      accent: "#059669",
      gold: "#fbbf24",
      glow: "rgba(220, 38, 38, 0.6)",
    },
    announcement: {
      badge: "🎄 NAVIDAD MÁGICA",
      text: "🎄 ¡Temporada Navideña! El regalo perfecto con empaque festivo, envíos prioritarios y sorpresas 🎁",
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
    subtitle: "Amor, Romance & Regalos Inolvidables",
    description: "Elegancia romántica apasionada con rojo pasión, fucsia dulce, polvo de estrellas doradas, lluvia de corazones vectoriales y ribete de amor en el header.",
    icon: "💖",
    emoji: "💖",
    previewBg: "from-pink-950 via-rose-950 to-neutral-900",
    previewGradients: "from-rose-600 via-pink-500 to-amber-400",
    palette: {
      primary: "#e11d48",
      light: "#fb7185",
      dark: "#881337",
      soft: "#fff1f2",
      accent: "#ec4899",
      gold: "#fbbf24",
      glow: "rgba(225, 29, 72, 0.6)",
    },
    announcement: {
      badge: "💖 SAN VALENTÍN",
      text: "💖 ¡Mes del Amor y la Amistad! Sorprende a esa persona especial con los mejores combos y detalles inolvidables 💘",
      ctaText: "Ver regalos de amor",
      ctaLink: "/tienda",
    },
    badges: {
      product: "💘 Especial San Valentín",
      banner: "EDICIÓN AMOR & AMISTAD",
    },
    effect: "valentine",
  },
  blackfriday: {
    id: "blackfriday",
    name: "Black Friday & Cyber Week",
    subtitle: "Mega Descuentos & Cyber Sale",
    description: "Estética Dark Luxury de alto impacto con negro azabache, amarillo eléctrico neón, relámpagos dorados, badges de % OFF extremo y resplandor cibernético.",
    icon: "🖤",
    emoji: "⚡",
    previewBg: "from-zinc-950 via-neutral-900 to-black",
    previewGradients: "from-yellow-500 via-amber-500 to-emerald-500",
    palette: {
      primary: "#eab308",
      light: "#facc15",
      dark: "#ca8a04",
      soft: "#fefce8",
      accent: "#22c55e",
      gold: "#fbbf24",
      glow: "rgba(234, 179, 8, 0.65)",
    },
    announcement: {
      badge: "⚡ BLACK FRIDAY",
      text: "🔥 ¡Mega Descuentos de Black Friday! Hasta 60% OFF en tecnología y accesorios por tiempo limitado 💥",
      ctaText: "Aprovechar ofertas",
      ctaLink: "/tienda",
    },
    badges: {
      product: "⚡ BLACK FRIDAY -XX%",
      banner: "CYBER & BLACK FRIDAY",
    },
    effect: "blackfriday",
  },
  newyear: {
    id: "newyear",
    name: "Año Nuevo & Gala",
    subtitle: "Celebración, Brindis & Fin de Año",
    description: "Atmósfera de gala y celebración con azul noche profundo, oro imperial resplandeciente, fuegos artificiales animados con explosiones de confeti en Canvas y copas de brindis.",
    icon: "🎆",
    emoji: "🍾",
    previewBg: "from-slate-950 via-purple-950 to-neutral-950",
    previewGradients: "from-amber-400 via-yellow-500 to-purple-600",
    palette: {
      primary: "#d97706",
      light: "#fbbf24",
      dark: "#92400e",
      soft: "#fffbeb",
      accent: "#7c3aed",
      gold: "#f59e0b",
      glow: "rgba(245, 158, 11, 0.6)",
    },
    announcement: {
      badge: "🎆 FELIZ AÑO NUEVO",
      text: "🍾 ¡Bienvenido el Nuevo Año! Celebra y equípate con las mejores ofertas exclusivas de fin de año 🥂",
      ctaText: "Ver colección de gala",
      ctaLink: "/tienda",
    },
    badges: {
      product: "✨ Edición Fin de Año",
      banner: "GALA DE AÑO NUEVO",
    },
    effect: "newyear",
  },
  summer: {
    id: "summer",
    name: "Verano & Summer Fest",
    subtitle: "Sol, Vacaciones & Ofertas Tropicales",
    description: "Energía vibrante y refrescante con azul turquesa océano, amarillo sol tropical, naranja atardecer cálido, palmeras vectoriales y destellos de sol resplandecientes.",
    icon: "🌴",
    emoji: "☀️",
    previewBg: "from-sky-950 via-teal-950 to-amber-950",
    previewGradients: "from-sky-500 via-teal-500 to-amber-400",
    palette: {
      primary: "#0284c7",
      light: "#38bdf8",
      dark: "#0369a1",
      soft: "#f0f9ff",
      accent: "#f59e0b",
      gold: "#fbbf24",
      glow: "rgba(2, 132, 199, 0.55)",
    },
    announcement: {
      badge: "☀️ SUMMER FEST",
      text: "🌴 ¡Temporada de Verano! Los mejores gadgets para tus viajes, playa y vacaciones con envíos gratis 🏖️",
      ctaText: "Ver ofertas de verano",
      ctaLink: "/tienda",
    },
    badges: {
      product: "🌴 Especial Verano",
      banner: "SUMMER VIBES",
    },
    effect: "summer",
  },
};

export const THEME_LIST = Object.values(SEASON_THEMES);

export function getSeasonTheme(id?: string | null): SeasonTheme {
  if (!id || !(id in SEASON_THEMES)) {
    return SEASON_THEMES.default;
  }
  return SEASON_THEMES[id as ThemeId];
}
