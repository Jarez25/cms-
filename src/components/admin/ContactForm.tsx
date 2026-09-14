"use client";

import { useState } from "react";
import { mapEmbedSrc } from "@/lib/map";

interface Props {
  initial: {
    title: string;
    subtitle: string;
    address: string;
    phone: string;
    email: string;
    whatsapp: string;
    hours: string;
    lat: number | null;
    lng: number | null;
    map_url: string;
  };
}

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

export default function ContactForm({ initial }: Props) {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [gmapsUrl, setGmapsUrl] = useState("");
  const [resolving, setResolving] = useState(false);
  const [resolveMsg, setResolveMsg] = useState("");
  const [iframeHtml, setIframeHtml] = useState("");

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function extractIframe() {
    const match = iframeHtml.match(/<iframe[^>]*src=["']([^"']+)["']/i);
    if (match?.[1]) {
      setForm((f) => ({ ...f, map_url: match[1] }));
      setResolveMsg("✓ Embed extraído del iframe");
    } else {
      setResolveMsg("No se encontró un atributo src en el iframe");
    }
  }

  async function resolveGmaps() {
    if (!gmapsUrl.trim()) return;
    setResolving(true);
    setResolveMsg("");
    try {
      const res = await fetch(`/api/maps/resolve?url=${encodeURIComponent(gmapsUrl.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setResolveMsg(data.error || "No se pudo resolver el enlace");
        return;
      }
      setForm((f) => ({ ...f, lat: data.lat, lng: data.lng }));
      setResolveMsg(`✓ Coordenadas obtenidas: ${data.lat.toFixed(6)}, ${data.lng.toFixed(6)}`);
    } catch {
      setResolveMsg("Error de conexión");
    } finally {
      setResolving(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setStatus("saving");
    try {
      const res = await fetch("/api/contact", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setStatus(res.ok ? "saved" : "error");
      if (res.ok) window.dispatchEvent(new Event("cms:reload-preview"));
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 3000);
  }

  const mapSrc = mapEmbedSrc(form.lat, form.lng, form.map_url);

  return (
    <form onSubmit={save} className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <h2 className="font-semibold text-gray-900">Sección Contacto</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Título</label>
            <input
              className={inputCls}
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Subtítulo</label>
            <input
              className={inputCls}
              value={form.subtitle}
              onChange={(e) => set("subtitle", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className={labelCls}>Dirección</label>
          <input
            className={inputCls}
            value={form.address}
            onChange={(e) => set("address", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              className={inputCls}
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              className={inputCls}
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>WhatsApp (solo números)</label>
            <input
              className={inputCls}
              value={form.whatsapp}
              onChange={(e) => set("whatsapp", e.target.value)}
              placeholder="+50688880000"
            />
          </div>
          <div>
            <label className={labelCls}>Horario</label>
            <input
              className={inputCls}
              value={form.hours}
              onChange={(e) => set("hours", e.target.value)}
              placeholder="Lun - Vie: 8:00 - 18:00"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="font-semibold text-gray-900">Ubicación (mapa)</h2>
          <p className="text-sm text-gray-500">
            Puedes poner las coordenadas (latitud/longitud) o pegar directamente la URL de un
            mapa embebido de Google Maps. Si pones coordenadas, el mapa se genera automáticamente.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Latitud</label>
            <input
              className={inputCls}
              value={form.lat ?? ""}
              onChange={(e) => set("lat", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="9.9281"
              type="number"
              step="any"
            />
          </div>
          <div>
            <label className={labelCls}>Longitud</label>
            <input
              className={inputCls}
              value={form.lng ?? ""}
              onChange={(e) => set("lng", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="-84.0907"
              type="number"
              step="any"
            />
          </div>
        </div>
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 space-y-3">
          <div>
            <label className={labelCls}>
              Pegar enlace de Google Maps (se extraen las coordenadas)
            </label>
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={gmapsUrl}
                onChange={(e) => setGmapsUrl(e.target.value)}
                placeholder="https://maps.app.goo.gl/..."
              />
              <button
                type="button"
                onClick={resolveGmaps}
                disabled={resolving || !gmapsUrl.trim()}
                className="shrink-0 bg-blue-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-blue-500 transition disabled:opacity-50"
              >
                {resolving ? "Obteniendo..." : "Obtener coordenadas"}
              </button>
            </div>
            {resolveMsg && (
              <p
                className={`text-sm mt-2 ${
                  resolveMsg.startsWith("✓") ? "text-green-600" : "text-red-600"
                }`}
              >
                {resolveMsg}
              </p>
            )}
          </div>
        </div>
        <div>
          <label className={labelCls}>URL de mapa embebido (opcional, prioridad)</label>
          <input
            className={inputCls}
            value={form.map_url}
            onChange={(e) => set("map_url", e.target.value)}
            placeholder="https://www.google.com/maps/embed?pb=..."
          />
        </div>
        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 space-y-3">
          <div>
            <label className={labelCls}>
              Pegar iframe de Google Maps (se extrae el src automáticamente)
            </label>
            <textarea
              className={inputCls}
              rows={4}
              spellCheck={false}
              value={iframeHtml}
              onChange={(e) => setIframeHtml(e.target.value)}
              placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
            />
            <button
              type="button"
              onClick={extractIframe}
              disabled={!iframeHtml.trim()}
              className="mt-2 bg-gray-900 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
            >
              Extraer embed del iframe
            </button>
          </div>
        </div>
        <div className="rounded-2xl overflow-hidden ring-1 ring-gray-200 min-h-[280px] bg-gray-100">
          {mapSrc ? (
            <iframe
              src={mapSrc}
              title="Vista previa del mapa"
              className="w-full h-full min-h-[280px] border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="h-full min-h-[280px] flex items-center justify-center text-gray-400 text-sm">
              Sin ubicación configurada
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={status === "saving"}
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-6 py-2.5 font-medium hover:from-blue-500 hover:to-sky-500 transition shadow-md shadow-blue-500/20 disabled:opacity-50"
        >
          {status === "saving" ? "Guardando..." : "Guardar cambios"}
        </button>
        {status === "saved" && <span className="text-green-600 text-sm">✓ Guardado</span>}
        {status === "error" && <span className="text-red-600 text-sm">Error al guardar</span>}
      </div>
    </form>
  );
}
