import Link from "next/link";
import type { FooterData } from "@/lib/data";

export default function SiteFooter({ footer }: { footer: FooterData }) {
  return (
    <footer className="bg-gray-950 text-gray-400">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 text-lg">Sobre nosotros</h3>
            <p className="text-sm leading-relaxed text-gray-400">{footer.about_text}</p>
            <div className="flex flex-wrap gap-2 mt-5">
              {footer.social_links.map((s, i) => (
                <a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-full bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center text-sm font-semibold text-gray-300 hover:text-white transition-colors"
                >
                  {s.label.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Enlaces</h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/tienda" className="hover:text-white transition-colors">Tienda</Link></li>
              <li><Link href="/nosotros" className="hover:text-white transition-colors">Nosotros</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contacto</h3>
            <ul className="space-y-3 text-sm">
              {footer.address && <li>{footer.address}</li>}
              {footer.phone && <li>{footer.phone}</li>}
              {footer.email && (
                <li>
                  <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors">
                    {footer.email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Atención</h3>
            <p className="text-sm text-gray-400 leading-relaxed">
              Estamos disponibles para ayudarte con tus compras y consultas.
            </p>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 mt-4 bg-primary hover:bg-primary-light text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors"
            >
              Contáctanos
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>{footer.copyright}</p>
          <p className="text-gray-600">Hecho con nuestro CMS</p>
        </div>
      </div>
    </footer>
  );
}
