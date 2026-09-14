import Link from "next/link";

interface Item {
  title: string;
  desc: string;
  href: string;
  icon: string;
}

export default function SectionCards({ items }: { items: Item[] }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-3xl border border-gray-200 bg-gray-50 p-7 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-light to-primary text-white flex items-center justify-center text-2xl shadow-lg shadow-primary-light/25">
              {item.icon}
            </span>
            <h3 className="font-bold text-gray-900 text-lg mt-5 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            <p className="text-gray-500 text-sm mt-2 leading-relaxed">{item.desc}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary mt-4">
              Explorar →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
