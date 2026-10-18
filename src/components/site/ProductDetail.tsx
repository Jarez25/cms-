"use client";

import { useState } from "react";
import Link from "next/link";
import type { ProductData } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  product: ProductData;
  currency: string;
  whatsapp: string;
  backHref: string;
}

export default function ProductDetail({ product, currency, whatsapp, backHref }: Props) {
  const [quantity, setQuantity] = useState(1);
  const maxStock = Math.max(1, product.stock || 1);

  function adjustQty(delta: number) {
    setQuantity((prev) => Math.min(Math.max(1, prev + delta), maxStock));
  }

  const cleanPhone = whatsapp.replace(/[^0-9]/g, "");
  const totalPrice = product.price * quantity;
  const whatsappMessage = encodeURIComponent(
    `Hola! Me interesa realizar un pedido:\n\n` +
    `📦 *Producto:* ${product.name}\n` +
    (product.sku ? `🏷️ *SKU:* ${product.sku}\n` : "") +
    (product.brand ? `🏢 *Marca:* ${product.brand}\n` : "") +
    `🔢 *Cantidad:* ${quantity}\n` +
    `💵 *Precio unitario:* ${formatPrice(product.price, currency)}\n` +
    `💰 *Total estimado:* ${formatPrice(totalPrice, currency)}\n\n` +
    `¿Tienen disponibilidad para coordinar la entrega?`
  );

  return (
    <main className="flex-1 py-14">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Galería / Imagen Principal */}
        <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden ring-1 ring-gray-200/80 shadow-sm relative group">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-400 font-medium">
              Sin imagen disponible
            </div>
          )}
          {product.brand && (
            <span className="absolute top-4 left-4 bg-gray-900/85 backdrop-blur-md rounded-full px-3.5 py-1 text-xs font-semibold text-white tracking-wide">
              {product.brand}
            </span>
          )}
        </div>

        {/* Detalles del Producto */}
        <div className="flex flex-col">
          <nav className="text-sm text-gray-500 mb-5">
            <Link href={backHref} className="hover:text-gray-900 font-medium transition-colors inline-flex items-center gap-1.5">
              <span>←</span> Volver a la tienda
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            {product.category && (
              <span className="bg-primary-soft text-primary-dark text-xs font-semibold rounded-full px-3 py-1 uppercase tracking-wider">
                {product.category}
              </span>
            )}
            {product.sku && (
              <span className="bg-gray-100 text-gray-600 text-xs font-mono font-medium rounded-full px-3 py-1">
                SKU: {product.sku}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {product.name}
          </h1>

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <p suppressHydrationWarning className="text-3xl font-extrabold text-primary">
              {formatPrice(product.price, currency)}
            </p>
            {product.compare_price && product.compare_price > product.price && (
              <>
                <span
                  suppressHydrationWarning
                  className="text-lg text-gray-400 line-through font-semibold"
                >
                  {formatPrice(product.compare_price, currency)}
                </span>
                <span className="bg-red-600 text-white text-xs font-black px-2.5 py-0.5 rounded-full shadow-xs animate-pulse">
                  -{Math.round(((product.compare_price - product.price) / product.compare_price) * 100)}% OFF
                </span>
              </>
            )}
            {quantity > 1 && (
              <span suppressHydrationWarning className="text-sm font-semibold text-gray-500">
                (Total: {formatPrice(totalPrice, currency)})
              </span>
            )}
          </div>

          <div className="mt-6 border-t border-b border-gray-100 py-4">
            <p className="text-gray-600 leading-relaxed text-sm md:text-base">
              {product.description || "Sin descripción detallada por el momento."}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-full px-4 py-2 border border-emerald-200/60">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Disponible · {product.stock} en stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-rose-700 bg-rose-50 rounded-full px-4 py-2 border border-rose-200/60">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Agotado
              </span>
            )}

            {/* Selector de Cantidad */}
            {product.stock > 0 && (
              <div className="flex items-center border border-gray-200 rounded-full bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  disabled={quantity <= 1}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:shadow-xs transition disabled:opacity-30 cursor-pointer"
                  aria-label="Disminuir cantidad"
                >
                  −
                </button>
                <span className="w-10 text-center font-bold text-gray-800 text-sm select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  disabled={quantity >= maxStock}
                  className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-gray-600 hover:bg-white hover:shadow-xs transition disabled:opacity-30 cursor-pointer"
                  aria-label="Aumentar cantidad"
                >
                  +
                </button>
              </div>
            )}
          </div>

          {/* Botón de Pedido por WhatsApp */}
          {cleanPhone && product.stock > 0 ? (
            <a
              href={`https://wa.me/${cleanPhone}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center justify-center gap-3 bg-emerald-600 text-white font-bold rounded-2xl px-8 py-4 hover:bg-emerald-700 hover:scale-[1.02] active:scale-98 transition-all shadow-lg shadow-emerald-600/25 self-start cursor-pointer"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413ZM12.05 21.78a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884Z" />
              </svg>
              <span>Pedir por WhatsApp {quantity > 1 ? `(${quantity} uds)` : ""}</span>
            </a>
          ) : null}
        </div>
      </div>
    </main>
  );
}
