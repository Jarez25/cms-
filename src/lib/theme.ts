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
