import type { AboutData } from "@/lib/data";

export default function AboutSection({ about }: { about: AboutData }) {
  return (
    <section id="nosotros" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Nosotros
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {about.title}
          </h2>
          {about.subtitle && (
            <p className="text-lg text-gray-500 mt-3">{about.subtitle}</p>
          )}
          <p className="text-gray-600 mt-6 leading-relaxed whitespace-pre-line">
            {about.content}
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden ring-1 ring-gray-200 aspect-[4/3] bg-gray-100">
          {about.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={about.image} alt={about.title} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-gray-300">
              sin imagen
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
