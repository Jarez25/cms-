import Link from "next/link";
import type { ProductData } from "@/lib/data";
import { formatPrice } from "@/lib/format";

interface Props {
  products: ProductData[];
  currency: string;
  productBase: string;
  seeAllHref: string;
}

export default function FeaturedProducts({ products, currency, productBase, seeAllHref }: Props) {
  if (!products.length) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary">
              Destacados
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
              Productos destacados
            </h2>
          </div>
          <Link
            href={seeAllHref}
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-dark"
          >
            Ver toda la tienda →
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`${productBase}/${p.slug}`}
              className="group bg-white rounded-3xl border border-gray-200/80 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="aspect-square bg-gray-100 overflow-hidden relative">
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-gray-300">
                    sin imagen
                  </div>
                )}
                {p.brand && (
                  <span className="absolute top-3 left-3 bg-gray-900/80 backdrop-blur rounded-full px-3 py-1 text-xs font-medium text-white">
                    {p.brand}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-extrabold text-gray-900">
                    {formatPrice(p.price, currency)}
                  </span>
                  <span className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center group-hover:bg-primary transition-colors text-sm">
                    →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link
            href={seeAllHref}
            className="inline-flex items-center gap-2 bg-gray-900 text-white rounded-full px-6 py-3 font-semibold hover:bg-gray-700 transition"
          >
            Ver toda la tienda
          </Link>
        </div>
      </div>
    </section>
  );
}
