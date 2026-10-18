export function formatPrice(price: number | string, currency: string): string {
  const n = Number(price) || 0;
  // Formato numérico determinista (evita desajustes de hidratación SSR vs Cliente por diferencias de locale)
  const parts = n.toFixed(2).split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const amount = parts.join(".");
  const sym = (currency || "").trim();
  if (!sym) return amount;
  if (/^[A-Za-z]{2,6}$/.test(sym)) return `${sym} ${amount}`;
  return `${sym}${amount}`;
}
