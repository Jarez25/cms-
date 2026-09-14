import Link from "next/link";
import type { CategorySummary } from "@/lib/data";

interface Props {
  items: CategorySummary[];
  basePath: string;
}

export default function CategoryTiles({ items, basePath }: Props) {
  if (!items.length) return null;

  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Categorías
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight mt-1">
            Explora por categoría
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {items.map((c) => (
            <Link
              key={c.category}
              href={`${basePath}/tienda?category=${encodeURIComponent(c.category)}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] bg-gray-100 ring-1 ring-gray-200"
            >
              {c.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.image}
                  alt={c.category}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-primary-light to-primary" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-semibold text-sm md:text-base line-clamp-2 leading-snug">
                  {c.category.split(">").pop()?.trim() || c.category}
                </p>
                <p className="text-white/70 text-xs mt-0.5">{c.count} productos</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
