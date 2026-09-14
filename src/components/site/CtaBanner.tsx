import Link from "next/link";

interface Props {
  title: string;
  subtitle: string;
  buttonText: string;
  href: string;
}

export default function CtaBanner({ title, subtitle, buttonText, href }: Props) {
  return (
    <section className="py-14 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-primary to-primary px-8 py-12 md:px-14 md:py-16">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
              <p className="text-primary-soft mt-2 max-w-xl">{subtitle}</p>
            </div>
            <Link
              href={href}
              className="shrink-0 inline-flex items-center gap-2 bg-white text-gray-900 font-semibold rounded-full px-7 py-3.5 hover:bg-primary-soft transition-colors"
            >
              {buttonText}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
