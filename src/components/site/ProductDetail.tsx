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
  return (
    <main className="flex-1 py-14">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden ring-1 ring-gray-200">
          {product.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300">
              sin imagen
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <nav className="text-sm text-gray-500 mb-6">
            <Link href={backHref} className="hover:text-gray-900 transition-colors">
              ← Volver a la tienda
            </Link>
          </nav>
          <div className="flex items-center gap-2 mb-2">
            {product.category && (
              <span className="bg-primary-soft text-primary-dark text-xs font-semibold rounded-full px-3 py-1 uppercase tracking-wide">
                {product.category}
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            {product.name}
          </h1>
          <p className="text-3xl font-extrabold text-primary mt-5">
            {formatPrice(product.price, currency)}
          </p>
          <p className="text-gray-600 mt-6 leading-relaxed">{product.description}</p>
          <div className="mt-6">
            {product.stock > 0 ? (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-green-700 bg-green-50 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Disponible · {product.stock} en stock
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 rounded-full px-4 py-2">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Agotado
              </span>
            )}
          </div>
          {whatsapp && product.stock > 0 && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                `Hola, me interesa el producto: ${product.name}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-9 inline-flex items-center justify-center gap-2 bg-green-500 text-white font-semibold rounded-full px-7 py-3.5 hover:bg-green-600 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-green-500/25 self-start"
            >
              Pedir por WhatsApp
            </a>
          )}
        </div>
      </div>
    </main>
  );
}
