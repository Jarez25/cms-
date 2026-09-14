import type { ContactData } from "@/lib/data";
import { mapEmbedSrc } from "@/lib/map";

export default function ContactSection({ contact }: { contact: ContactData }) {
  const mapSrc = mapEmbedSrc(contact.lat, contact.lng, contact.map_url);

  const infoItems = [
    { label: "Dirección", value: contact.address, href: contact.address ? `https://maps.google.com/?q=${encodeURIComponent(contact.address)}` : undefined },
    { label: "Teléfono", value: contact.phone, href: contact.phone ? `tel:${contact.phone}` : undefined },
    { label: "Email", value: contact.email, href: contact.email ? `mailto:${contact.email}` : undefined },
    { label: "Horario", value: contact.hours },
  ].filter((i) => i.value);

  const whatsapp = contact.whatsapp.replace(/[^0-9]/g, "");

  return (
    <section id="contacto" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Contacto
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {contact.title}
          </h2>
          {contact.subtitle && <p className="text-gray-500 mt-3">{contact.subtitle}</p>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex items-center gap-4"
              >
                <div className="w-11 h-11 rounded-xl bg-primary-soft text-primary flex items-center justify-center shrink-0">
                  <span className="text-lg font-bold">{item.label.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                    {item.label}
                  </p>
                  {item.href ? (
                    <a
                      href={item.href}
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="font-medium text-gray-900 hover:text-primary transition-colors break-words"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="font-medium text-gray-900 break-words">{item.value}</p>
                  )}
                </div>
              </div>
            ))}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-green-500 text-white font-semibold rounded-full px-6 py-3 hover:bg-green-600 transition-colors shadow-lg shadow-green-500/25"
              >
                Escribir por WhatsApp
              </a>
            )}
          </div>

          <div className="rounded-3xl overflow-hidden ring-1 ring-gray-200 min-h-[360px] bg-gray-100">
            {mapSrc ? (
              <iframe
                src={mapSrc}
                title="Mapa de ubicación"
                className="w-full h-full min-h-[360px] border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            ) : (
              <div className="h-full min-h-[360px] flex items-center justify-center text-gray-400">
                Configura una ubicación para mostrar el mapa
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
