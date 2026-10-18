import Link from "next/link";
import type { CategorySummary } from "@/lib/data";

interface Props {
  items: CategorySummary[];
  basePath: string;
}

export default function CategoryTiles({ items, basePath }: Props) {
  if (!items.length) return null;

  return (
    <section className="py-16 bg-gray-50/60 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <span>Colecciones Destacadas</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Explora por categoría
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-xl">
              Equipos de alta ingeniería acústica, periféricos de precisión y gadgets diseñados para rendir al máximo.
            </p>
          </div>
          <Link
            href={`${basePath}/tienda`}
            className="text-sm font-bold text-primary hover:text-primary-dark transition-colors inline-flex items-center gap-1.5 shrink-0"
          >
            Ver catálogo completo <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {items.map((c) => (
            <Link
              key={c.category}
              href={`${basePath}/tienda?category=${encodeURIComponent(c.category)}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/5] bg-gray-900 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1 ring-1 ring-gray-900/5"
            >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.category}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary-dark" />
              )}
              {/* Gradient Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-950/30 to-black/10 group-hover:via-gray-950/20 transition-all duration-500" />

              {/* Tag Superior */}
              <div className="absolute top-4 right-4">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/40 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white/90 border border-white/10 group-hover:border-white/30 transition-colors">
                  {c.count} items
                </span>
              </div>

              {/* Contenido Inferior */}
              <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 flex items-end justify-between">
                <div>
                  <p className="text-white font-bold text-base md:text-lg line-clamp-2 leading-snug group-hover:text-primary-soft transition-colors">
                    {c.category.split(">").pop()?.trim() || c.category}
                  </p>
                  <p className="text-white/60 text-xs mt-1 flex items-center gap-1 group-hover:text-white/90 transition-colors">
                    <span>Ver productos</span>
                    <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
