export function formatPrice(price: number | string, currency: string): string {
  const n = Number(price) || 0;
  const amount = n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const sym = (currency || "").trim();
  if (!sym) return amount;
  if (/^[A-Za-z]{2,6}$/.test(sym)) return `${sym} ${amount}`;
  return `${sym}${amount}`;
}
