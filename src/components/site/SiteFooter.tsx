import Link from "next/link";
import type { FooterData } from "@/lib/data";

export default function SiteFooter({ footer }: { footer: FooterData }) {
  return (
    <footer className="bg-gray-950 text-gray-400 border-t border-gray-900">
      <div className="container-site py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Columna Marca & Sobre Nosotros */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-black text-white text-base shadow-sm">
                N
              </span>
              <span className="font-extrabold text-white text-xl tracking-tight">NOVA TECH</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-400 max-w-sm">
              {footer.about_text || "Tecnología de alta gama, audio profesional y accesorios de diseño para creadores y entusiastas del buen rendimiento."}
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              {footer.social_links.map((s, i) => (
                <a
                  key={i}
                  href={s.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 hover:bg-primary hover:border-primary flex items-center justify-center text-xs font-bold text-gray-300 hover:text-white transition-all shadow-xs"
                >
                  {s.label.charAt(0).toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Columna Navegación */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Explorar</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Portada Principal
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="hover:text-white transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/tienda?category=Audio%20%26%20Sonido" className="hover:text-white transition-colors">
                  Audio & Sonido
                </Link>
              </li>
              <li>
                <Link href="/tienda?category=Gaming%20%26%20Setup" className="hover:text-white transition-colors">
                  Gaming & Setup
                </Link>
              </li>
              <li>
                <Link href="/nosotros" className="hover:text-white transition-colors">
                  Nuestra Historia
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna Soporte & Políticas */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Información</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/pagina/politicas-de-envio" className="hover:text-white transition-colors">
                  Políticas de Envío
                </Link>
              </li>
              <li>
                <Link href="/pagina/garantia-y-devoluciones" className="hover:text-white transition-colors">
                  Garantía Oficial
                </Link>
              </li>
              <li>
                <Link href="/pagina/preguntas-frecuentes" className="hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/contacto" className="hover:text-white transition-colors">
                  Soporte & Ubicación
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna Contacto */}
          <div>
            <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">Atención</h3>
            <ul className="space-y-3 text-sm">
              {footer.address && (
                <li className="flex items-start gap-2">
                  <span className="text-gray-500 mt-0.5">📍</span>
                  <span>{footer.address}</span>
                </li>
              )}
              {footer.phone && (
                <li className="flex items-center gap-2">
                  <span className="text-gray-500">📞</span>
                  <span>{footer.phone}</span>
                </li>
              )}
              {footer.email && (
                <li className="flex items-center gap-2">
                  <span className="text-gray-500">✉️</span>
                  <a href={`mailto:${footer.email}`} className="hover:text-white transition-colors truncate">
                    {footer.email}
                  </a>
                </li>
              )}
            </ul>
            <Link
              href="/contacto"
              className="inline-flex items-center gap-2 mt-5 bg-white/10 hover:bg-primary border border-white/15 hover:border-primary text-white text-xs font-bold rounded-xl px-4 py-2.5 transition-all shadow-xs"
            >
              <span>Escribir al Showroom</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Métodos de Pago y Confianza */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-400">Métodos aceptados:</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">VISA</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">Mastercard</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">Yape / Plin</span>
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-gray-300 font-mono">Contra entrega</span>
          </div>
          <div className="flex items-center gap-4">
            <span>🛡️ Compra 100% Segura</span>
            <span>🚀 Envíos a todo el país</span>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/5 bg-black/40">
        <div className="container-site py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>{footer.copyright || "© 2026 NOVA TECH Studio. Todos los derechos reservados."}</p>
          <p className="text-gray-600">Construido con tecnología CMS propia</p>
        </div>
      </div>
    </footer>
  );
}
