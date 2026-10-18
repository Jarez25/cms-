import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
  badge?: string;
}

export default function CtaBanner({
  title,
  subtitle,
  buttonText,
  href,
  badge = "⭐ Oferta Especial",
}: Props) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-950 via-gray-900 to-primary-dark px-8 py-12 md:px-14 md:py-16 shadow-xl border border-gray-800">
          {/* Subtle Ambient Orbs */}
          <div className="absolute -right-10 -top-10 w-72 h-72 rounded-full bg-primary/25 blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              {badge && badge.trim() !== "" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold uppercase tracking-wider mb-3 backdrop-blur-md border border-white/10">
                  {badge}
                </span>
              )}
              <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {title}
              </h2>
              <p className="text-gray-300 mt-2.5 text-sm md:text-base leading-relaxed">
                {subtitle}
              </p>
            </div>
            <Link
              href={href}
              className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-gray-950 font-extrabold rounded-2xl px-8 py-4 hover:bg-gray-100 hover:scale-[1.02] active:scale-98 transition-all shadow-lg self-start md:self-auto cursor-pointer"
            >
              <span>{buttonText}</span>
              <span className="text-lg">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
