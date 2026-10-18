"use client";

import { useEffect, useRef, useState } from "react";
import ImagePicker from "./ImagePicker";
import { notify, confirmAction } from "./feedback";

interface ComponentItem {
  id: number;
  provider_id: number | null;
  name: string;
  type: string;
  props: Record<string, unknown>;
  is_active: number;
  is_hidden: number;
}

interface Field {
  label: string;
  name: string;
  type: string;
  required?: boolean;
}

interface Page {
  id: number;
  title: string;
  slug: string;
  content: string;
  components: number[];
  is_active: number;
}

const TYPES: { value: string; label: string; group: "interactive" | "code" }[] = [
  { value: "banner", label: "Banner (visual)", group: "interactive" },
  { value: "cta", label: "Llamado a la acción (CTA)", group: "interactive" },
  { value: "form", label: "Formulario", group: "interactive" },
  { value: "products", label: "Productos (carrusel)", group: "interactive" },
  { value: "html", label: "HTML personalizado", group: "code" },
];

const TYPE_META: Record<string, { label: string; gradient: string; icon: string }> = {
  banner: {
    label: "Banner",
    gradient: "from-blue-500 to-sky-600",
    icon: "M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5z",
  },
  cta: {
    label: "Llamado a la acción",
    gradient: "from-blue-500 to-sky-600",
    icon: "M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46",
  },
  form: {
    label: "Formulario",
    gradient: "from-emerald-500 to-teal-600",
    icon: "M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z",
  },
  products: {
    label: "Productos",
    gradient: "from-amber-500 to-orange-600",
    icon: "M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9",
  },
  html: {
    label: "HTML personalizado",
    gradient: "from-rose-500 to-pink-600",
    icon: "M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5",
  },
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  const meta = TYPE_META[type] ?? TYPE_META.html;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "w-6 h-6"}
      aria-hidden="true"
    >
      <path d={meta.icon} />
    </svg>
  );
}

import HtmlBlock from "../site/HtmlBlock";

const CODE_TEMPLATES: { id: string; label: string; icon: string; code: string }[] = [
  {
    id: "bento",
    label: "🚀 Bento Grid High-Tech (4 Tarjetas)",
    icon: "🚀",
    code: `<div data-full-width="true" class="py-16 bg-[#080b14] text-white">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-12">
      <span class="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full bg-indigo-500/10">Ingeniería de Élite</span>
      <h2 class="text-3xl sm:text-4xl font-black mt-4 tracking-tight">Diseñado para el Rendimiento Extremo</h2>
      <p class="text-gray-400 mt-3 text-sm sm:text-base">Componentes calibrados al milímetro para creadores, audiófilos y setups de alto nivel.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="md:col-span-2 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
        <div class="relative z-10">
          <span class="text-2xl">🎧</span>
          <h3 class="text-2xl font-bold mt-4">Acoustic Studio V1 & Hi-Res</h3>
          <p class="text-gray-300 mt-2 text-sm max-w-md">Diafragmas de fibra de carbono de 40mm con respuesta de frecuencia de 4Hz a 40,000Hz sin distorsión armónica.</p>
          <div class="mt-6 flex flex-wrap gap-2 text-xs">
            <span class="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg border border-indigo-500/30">99.4% Fidelidad</span>
            <span class="bg-white/10 px-3 py-1 rounded-lg">LDAC 990kbps</span>
            <span class="bg-white/10 px-3 py-1 rounded-lg">8 Mics ANC</span>
          </div>
        </div>
      </div>
      <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-amber-500/50 transition-all">
        <span class="text-2xl">⚡</span>
        <h3 class="text-xl font-bold mt-4">Carga GaN III 250W</h3>
        <p class="text-gray-300 mt-2 text-xs">Hasta 3 dispositivos al 100% simultáneamente con telemetría en pantalla a color.</p>
        <div class="mt-6 text-3xl font-black text-amber-400">18 min <span class="text-xs text-gray-400 font-normal">al 50%</span></div>
      </div>
      <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
        <span class="text-2xl">⌨️</span>
        <h3 class="text-xl font-bold mt-4">CNC Anodizado 6063</h3>
        <p class="text-gray-300 mt-2 text-xs">Tolerancia milimétrica, montaje gasket mount y switches mecánicos pre-lubricados.</p>
        <div class="mt-4 text-xs font-mono text-emerald-400">Tolerancia: ±0.01mm</div>
      </div>
      <div class="md:col-span-2 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col justify-between">
        <div>
          <span class="text-2xl">⌚</span>
          <h3 class="text-2xl font-bold mt-4">Titanio Aeroespacial & Resistencia Extrema</h3>
          <p class="text-gray-300 mt-2 text-sm">Caja sellada herméticamente para expediciones, buceo a 40 metros y pantalla OLED de 3000 nits.</p>
        </div>
        <div class="mt-6 flex items-center justify-between border-t border-white/10 pt-4 text-xs text-gray-400">
          <span>Estándar Militar MIL-STD 810H</span>
          <span class="text-cyan-400 font-bold">WR100 Sumergible</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: "specs",
    label: "⚡ Comparador de Ficha Técnica (Pestañas JS)",
    icon: "⚡",
    code: `<div class="py-14 bg-white">
  <div class="max-w-5xl mx-auto px-4">
    <div class="text-center mb-8">
      <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Comparativa de Modelos</span>
      <h2 class="text-3xl font-extrabold text-gray-900 mt-3">Ficha Técnica & Desempeño</h2>
      <p class="text-gray-500 text-sm mt-1">Selecciona un modelo para ver sus características detalladas en tiempo real.</p>
    </div>
    <div class="flex justify-center gap-2 mb-8" id="spec-tabs">
      <button onclick="window.switchTab('sony')" id="btn-sony" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-md transition">Sony WH-1000XM5</button>
      <button onclick="window.switchTab('keyboard')" id="btn-keyboard" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Teclado Custom CNC</button>
      <button onclick="window.switchTab('watch')" id="btn-watch" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition">Apple Watch Ultra 2</button>
    </div>
    <div id="spec-content" class="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div>
          <span class="text-xs font-bold text-blue-600 uppercase" id="spec-cat">AUDIO DE ALTA RESOLUCIÓN</span>
          <h3 class="text-2xl font-bold text-gray-900 mt-1" id="spec-title">Sony WH-1000XM5</h3>
          <p class="text-sm text-gray-600 mt-2" id="spec-desc">Auriculares circumaurales inalámbricos con dos procesadores dedicados y 8 micrófonos para cancelación de ruido adaptativa inigualable.</p>
          <ul class="mt-4 space-y-2 text-sm text-gray-700" id="spec-list">
            <li class="flex items-center gap-2">✓ Autonomía: 30 horas con ANC activo</li>
            <li class="flex items-center gap-2">✓ Carga rápida: 3 min = 3 horas de reproducción</li>
            <li class="flex items-center gap-2">✓ Conectividad: Multipunto Bluetooth 5.2 + Cable 3.5mm</li>
            <li class="flex items-center gap-2">✓ Peso: 250 gramos de construcción ergonómica</li>
          </ul>
        </div>
        <div class="bg-white rounded-2xl p-6 border border-gray-200 text-center shadow-xs">
          <p class="text-xs text-gray-400 uppercase font-semibold">Precio Oficial</p>
          <div class="text-3xl font-black text-gray-900 mt-1" id="spec-price">S/. 1,399.00</div>
          <p class="text-xs text-emerald-600 font-bold mt-1">● Garantía Oficial 12 Meses</p>
          <a href="/tienda" class="mt-6 inline-block w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-gray-800 transition">Comprar en Tienda</a>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
window.switchTab = function(model) {
  const tabs = {
    sony: {
      cat: "AUDIO DE ALTA RESOLUCIÓN",
      title: "Sony WH-1000XM5",
      desc: "Auriculares circumaurales inalámbricos con dos procesadores dedicados y 8 micrófonos para cancelación de ruido adaptativa inigualable.",
      items: ["Autonomía: 30 horas con ANC activo", "Carga rápida: 3 min = 3 horas de reproducción", "Conectividad: Multipunto Bluetooth 5.2 + Cable 3.5mm", "Peso: 250 gramos de construcción ergonómica"],
      price: "S/. 1,399.00"
    },
    keyboard: {
      cat: "GAMING & PRODUCTIVIDAD SETUP",
      title: "Teclado Mecánico CNC Custom",
      desc: "Chasis macizo de aluminio anodizado 6063, montaje por juntas (gasket mount) y switches lubricados a mano para acústica profunda.",
      items: ["Chasis: Bloque macizo de aluminio CNC", "Conexión: Triple Modo (2.4G inalámbrico, BT 5.2, USB-C)", "Switches: Hot-swappable 5-pin pre-lubricados", "Batería: 4000mAh para más de 200 horas de uso"],
      price: "S/. 459.00"
    },
    watch: {
      cat: "SMART TECH & EXPEDICIONES",
      title: "Apple Watch Ultra 2 Titanium",
      desc: "Caja de titanio aeroespacial de 49mm, pantalla Retina OLED de hasta 3000 nits y GPS dual de máxima precisión para atletas.",
      items: ["Pantalla: Cristal de zafiro plano de 3000 nits", "Resistencia: Certificación WR100 y buceo EN13319 a 40m", "Sensores: Oxígeno en sangre, ECG, temperatura y profundidad", "Batería: Hasta 72 horas en modo bajo consumo"],
      price: "S/. 3,499.00"
    }
  };
  const d = tabs[model];
  if (!d) return;
  const catEl = document.getElementById('spec-cat');
  const titleEl = document.getElementById('spec-title');
  const descEl = document.getElementById('spec-desc');
  const priceEl = document.getElementById('spec-price');
  const listEl = document.getElementById('spec-list');
  if (catEl) catEl.innerText = d.cat;
  if (titleEl) titleEl.innerText = d.title;
  if (descEl) descEl.innerText = d.desc;
  if (priceEl) priceEl.innerText = d.price;
  if (listEl) listEl.innerHTML = d.items.map(x => '<li class="flex items-center gap-2">✓ ' + x + '</li>').join('');
  ['sony', 'keyboard', 'watch'].forEach(k => {
    const btn = document.getElementById('btn-' + k);
    if (!btn) return;
    if (k === model) {
      btn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-blue-600 text-white shadow-md transition';
    } else {
      btn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 transition';
    }
  });
};
</script>`,
  },
  {
    id: "reviews",
    label: "💬 Muro de Reseñas y Testimonios (5★)",
    icon: "💬",
    code: `<div class="py-14 bg-gray-50 border-t border-gray-100">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
      <div>
        <span class="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Opiniones Reales</span>
        <h2 class="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">Lo que dicen nuestros clientes</h2>
      </div>
      <div class="mt-2 sm:mt-0 flex items-center gap-2 text-sm text-gray-600">
        <span class="text-amber-500 text-lg">★★★★★</span>
        <span class="font-bold text-gray-900">4.9 / 5</span> (Más de 1,200 pedidos entregados)
      </div>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div class="text-amber-400 text-sm mb-2">★★★★★</div>
          <p class="text-sm text-gray-700 leading-relaxed">"Compré los Sony WH-1000XM5 y llegaron el mismo día en Lima. El empaque impecable y la cancelación de ruido es otro nivel para trabajar en oficina."</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <div><p class="font-bold text-gray-900">Carlos Mendoza</p><p class="text-gray-400">Lima, Perú</p></div>
          <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">✓ Compra verificada</span>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div class="text-amber-400 text-sm mb-2">★★★★★</div>
          <p class="text-sm text-gray-700 leading-relaxed">"El teclado mecánico superó todas mis expectativas. El sonido de los switches lubricados es una delicia y la conexión inalámbrica no tiene nada de lag."</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <div><p class="font-bold text-gray-900">Valeria Sotomayor</p><p class="text-gray-400">Arequipa, Perú</p></div>
          <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">✓ Compra verificada</span>
        </div>
      </div>
      <div class="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs flex flex-col justify-between">
        <div>
          <div class="text-amber-400 text-sm mb-2">★★★★★</div>
          <p class="text-sm text-gray-700 leading-relaxed">"Atención de primera por WhatsApp. Me asesoraron sobre la estación MagSafe de Nomad y el Apple Watch. Llegó con boleta y garantía oficial."</p>
        </div>
        <div class="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs">
          <div><p class="font-bold text-gray-900">Martín Benavides</p><p class="text-gray-400">Trujillo, Perú</p></div>
          <span class="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">✓ Compra verificada</span>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: "countdown",
    label: "⏱️ Banner Oferta Flash con Countdown en vivo",
    icon: "⏱️",
    code: `<div data-full-width="true" class="py-12 bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white">
  <div class="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8">
    <div>
      <span class="text-xs font-bold uppercase tracking-[0.2em] text-indigo-300 bg-white/10 px-3 py-1 rounded-full">Oferta Limitada</span>
      <h2 class="text-3xl font-black mt-3">Semana de Lanzamientos NOVA TECH</h2>
      <p class="text-indigo-200 mt-2 text-sm max-w-lg">Hasta 25% de descuento en periféricos seleccionados y envío gratis en compras mayores a S/. 299.</p>
    </div>
    <div class="flex items-center gap-3">
      <div class="text-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[70px] border border-white/10">
        <div class="text-2xl font-black" id="cd-hours">14</div>
        <div class="text-[10px] uppercase tracking-wider text-indigo-300">Horas</div>
      </div>
      <span class="text-2xl font-bold">:</span>
      <div class="text-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[70px] border border-white/10">
        <div class="text-2xl font-black" id="cd-minutes">32</div>
        <div class="text-[10px] uppercase tracking-wider text-indigo-300">Min</div>
      </div>
      <span class="text-2xl font-bold">:</span>
      <div class="text-center bg-white/10 backdrop-blur-md rounded-2xl px-4 py-3 min-w-[70px] border border-white/10">
        <div class="text-2xl font-black text-amber-400" id="cd-seconds">45</div>
        <div class="text-[10px] uppercase tracking-wider text-indigo-300">Seg</div>
      </div>
      <a href="/tienda" class="ml-4 px-6 py-3.5 bg-white text-gray-950 font-bold rounded-2xl hover:bg-indigo-50 shadow-lg transition">Ver Ofertas →</a>
    </div>
  </div>
</div>
<script>
(function() {
  let sec = 45;
  let min = 32;
  let hrs = 14;
  setInterval(() => {
    sec--;
    if (sec < 0) { sec = 59; min--; }
    if (min < 0) { min = 59; hrs--; }
    const sEl = document.getElementById('cd-seconds');
    const mEl = document.getElementById('cd-minutes');
    const hEl = document.getElementById('cd-hours');
    if (sEl) sEl.innerText = sec < 10 ? '0' + sec : sec;
    if (mEl) mEl.innerText = min < 10 ? '0' + min : min;
    if (hEl) hEl.innerText = hrs < 10 ? '0' + hrs : hrs;
  }, 1000);
})();
</script>`,
  },
  {
    id: "faq",
    label: "❓ Preguntas Frecuentes (Acordeón Interactivo)",
    icon: "❓",
    code: `<div class="py-14 bg-white">
  <div class="max-w-4xl mx-auto px-4">
    <div class="text-center mb-10">
      <span class="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Dudas Habituales</span>
      <h2 class="text-3xl font-extrabold text-gray-900 mt-2">Preguntas Frecuentes</h2>
      <p class="text-gray-500 text-sm mt-1">Todo lo que necesitas saber sobre envíos, garantías y métodos de pago.</p>
    </div>
    <div class="space-y-4">
      <details class="group bg-gray-50 rounded-2xl border border-gray-200 p-5 cursor-pointer">
        <summary class="font-bold text-gray-900 flex items-center justify-between list-none">
          <span>¿Hacen envíos a todo el Perú y cuánto tardan?</span>
          <span class="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p class="text-sm text-gray-600 mt-3 leading-relaxed">Sí, realizamos envíos a nivel nacional. En Lima Metropolitana las entregas se realizan el mismo día o en 24 horas hábiles. Para provincias el tiempo de entrega es de 48 a 72 horas mediante Olva Courier o Shalom con número de seguimiento en vivo.</p>
      </details>
      <details class="group bg-gray-50 rounded-2xl border border-gray-200 p-5 cursor-pointer">
        <summary class="font-bold text-gray-900 flex items-center justify-between list-none">
          <span>¿Los productos cuentan con garantía oficial?</span>
          <span class="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p class="text-sm text-gray-600 mt-3 leading-relaxed">Todos nuestros productos son 100% nuevos, sellados de fábrica y cuentan con 12 meses de garantía directa contra cualquier defecto de fabricación. Emitimos boleta y factura electrónica.</p>
      </details>
      <details class="group bg-gray-50 rounded-2xl border border-gray-200 p-5 cursor-pointer">
        <summary class="font-bold text-gray-900 flex items-center justify-between list-none">
          <span>¿Puedo pagar contra entrega o con tarjeta de crédito?</span>
          <span class="text-blue-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <p class="text-sm text-gray-600 mt-3 leading-relaxed">Aceptamos transferencias bancarias (BCP, BBVA, Interbank), Yape, Plin y tarjetas de crédito o débito Visa y Mastercard. En Lima Metropolitana también contamos con pago contra entrega previa coordinación por WhatsApp.</p>
      </details>
    </div>
  </div>
</div>`,
  },
  {
    id: "reels",
    label: "📱 Video Commerce / Reels (Míralo en Video)",
    icon: "📱",
    code: `<div class="py-14 bg-gray-950 text-white">
  <div class="max-w-6xl mx-auto px-4">
    <div class="flex items-center justify-between mb-8">
      <div>
        <span class="text-xs font-bold uppercase tracking-[0.2em] text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">Video Commerce</span>
        <h2 class="text-3xl font-black mt-2">Míralo en Video</h2>
        <p class="text-gray-400 text-sm mt-1">Conoce el desempaquetado, sonido y funcionamiento real de nuestros productos.</p>
      </div>
      <a href="https://instagram.com" target="_blank" class="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-rose-400 hover:text-rose-300 transition">Ver más en Instagram →</a>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg cursor-pointer">
        <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80" alt="Sony XM5" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
          <span class="text-rose-500">▶</span> REELS
        </div>
        <div class="absolute bottom-4 left-4 right-4 text-left">
          <h4 class="text-sm font-bold text-white line-clamp-2">Test de Cancelación de Ruido Sony WH-1000XM5</h4>
          <p class="text-xs text-rose-400 font-bold mt-1">S/. 1,399.00</p>
        </div>
      </div>
      <div class="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg cursor-pointer">
        <img src="https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80" alt="Keyboard" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
          <span class="text-rose-500">▶</span> SOUND TEST
        </div>
        <div class="absolute bottom-4 left-4 right-4 text-left">
          <h4 class="text-sm font-bold text-white line-clamp-2">Sound Test: Teclado Mecánico con Switches Gateron</h4>
          <p class="text-xs text-rose-400 font-bold mt-1">S/. 459.00</p>
        </div>
      </div>
      <div class="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg cursor-pointer">
        <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80" alt="Apple Watch" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
          <span class="text-rose-500">▶</span> REVIEW
        </div>
        <div class="absolute bottom-4 left-4 right-4 text-left">
          <h4 class="text-sm font-bold text-white line-clamp-2">Prueba bajo el agua: Apple Watch Ultra 2</h4>
          <p class="text-xs text-rose-400 font-bold mt-1">S/. 3,499.00</p>
        </div>
      </div>
      <div class="group relative aspect-[9/16] rounded-3xl overflow-hidden bg-gray-900 border border-white/10 shadow-lg cursor-pointer">
        <img src="https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=600&q=80" alt="Marshall Speaker" class="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
        <div class="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-bold text-white flex items-center gap-1">
          <span class="text-rose-500">▶</span> UNBOXING
        </div>
        <div class="absolute bottom-4 left-4 right-4 text-left">
          <h4 class="text-sm font-bold text-white line-clamp-2">Unboxing y prueba acústica Marshall Stanmore III</h4>
          <p class="text-xs text-rose-400 font-bold mt-1">S/. 1,599.00</p>
        </div>
      </div>
    </div>
  </div>
</div>`,
  },
  {
    id: "room_builder",
    label: "🛋️ Arma tu Espacio (Room Builder & Kit)",
    icon: "🛋️",
    code: `<div class="py-14 bg-gray-50 border-y border-gray-200">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center max-w-2xl mx-auto mb-10">
      <span class="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Kits & Espacios</span>
      <h2 class="text-3xl font-extrabold text-gray-900 mt-3">Arma tu Espacio</h2>
      <p class="text-gray-500 text-sm mt-1">Selecciona el ambiente que quieres renovar y obtén el combo completo con descuento especial.</p>
    </div>
    <div class="flex justify-center gap-2 mb-8" id="room-tabs">
      <button onclick="window.switchRoom('setup')" id="btn-room-setup" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-md transition">🖥️ Setup Gamer & Trabajo</button>
      <button onclick="window.switchRoom('audio')" id="btn-room-audio" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition">🎵 Estudio de Audio Hi-Fi</button>
      <button onclick="window.switchRoom('mobile')" id="btn-room-mobile" class="px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition">⚡ Creador Móvil & Viajes</button>
    </div>
    <div class="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm">
      <div class="flex flex-col lg:flex-row items-center justify-between gap-8">
        <div class="flex-1 space-y-3">
          <span class="text-xs font-bold text-indigo-600 uppercase tracking-wide" id="room-tag">COMBO SETUP PRO</span>
          <h3 class="text-2xl font-black text-gray-900" id="room-title">Kit Estación de Trabajo & Gaming 2026</h3>
          <p class="text-sm text-gray-600 leading-relaxed" id="room-desc">Incluye Teclado Mecánico Custom CNC, BenQ ScreenBar Halo inalámbrica y Stream Deck MK.2 para máxima productividad.</p>
          <div class="pt-3 flex flex-wrap gap-2" id="room-items">
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-800">⌨️ Teclado Custom CNC</span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-800">💡 BenQ ScreenBar Halo</span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-800">🎮 Stream Deck MK.2</span>
          </div>
        </div>
        <div class="w-full lg:w-72 bg-indigo-50 border border-indigo-100 rounded-2xl p-6 text-center">
          <span class="text-xs font-bold text-indigo-700 uppercase">Ahorro del 15%</span>
          <div class="text-3xl font-black text-gray-900 mt-2" id="room-price">S/. 1,475.00</div>
          <p class="text-xs text-gray-400 line-through mt-0.5" id="room-old-price">S/. 1,738.00</p>
          <a id="room-link" href="/contacto" class="mt-5 inline-block w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition shadow-md shadow-indigo-200">Pedir Combo Completo</a>
        </div>
      </div>
    </div>
  </div>
</div>
<script>
window.switchRoom = function(type) {
  const rooms = {
    setup: {
      tag: "COMBO SETUP PRO",
      title: "Kit Estación de Trabajo & Gaming 2026",
      desc: "Incluye Teclado Mecánico Custom CNC, BenQ ScreenBar Halo inalámbrica y Stream Deck MK.2 para máxima productividad.",
      items: ["⌨️ Teclado Custom CNC", "💡 BenQ ScreenBar Halo", "🎮 Stream Deck MK.2"],
      price: "S/. 1,475.00",
      oldPrice: "S/. 1,738.00"
    },
    audio: {
      tag: "COMBO ESTUDIO ACÚSTICO",
      title: "Kit Producción de Audio & Podcast",
      desc: "Incluye Micrófono Dinámico Shure SM7B, Audífonos Sony WH-1000XM5 Hi-Res y Parlante Marshall Stanmore III.",
      items: ["🎙️ Shure SM7B Cardioide", "🎧 Sony WH-1000XM5", "📻 Marshall Stanmore III"],
      price: "S/. 3,999.00",
      oldPrice: "S/. 4,697.00"
    },
    mobile: {
      tag: "COMBO CREADOR ON-THE-GO",
      title: "Kit Carga Ultrarrápida & Wearable",
      desc: "Incluye Apple Watch Ultra 2 Titanium, Power Bank Anker Prime 250W y Estación Nomad MagSafe 3-en-1.",
      items: ["⌚ Apple Watch Ultra 2", "🔋 Anker Prime 250W GaN", "⚡ Nomad Base One Max"],
      price: "S/. 3,899.00",
      oldPrice: "S/. 4,587.00"
    }
  };
  const d = rooms[type];
  if (!d) return;
  document.getElementById('room-tag').innerText = d.tag;
  document.getElementById('room-title').innerText = d.title;
  document.getElementById('room-desc').innerText = d.desc;
  document.getElementById('room-price').innerText = d.price;
  document.getElementById('room-old-price').innerText = d.oldPrice;
  document.getElementById('room-items').innerHTML = d.items.map(it => '<span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 text-xs font-semibold text-gray-800">' + it + '</span>').join('');
  ['setup', 'audio', 'mobile'].forEach(k => {
    const btn = document.getElementById('btn-room-' + k);
    if (!btn) return;
    if (k === type) {
      btn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-indigo-600 text-white shadow-md transition';
    } else {
      btn.className = 'px-5 py-2.5 rounded-xl font-bold text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 transition';
    }
  });
};
</script>`,
  },
  {
    id: "payments",
    label: "💳 Paga y Recibe como Prefieras (Métodos y Envíos)",
    icon: "💳",
    code: `<div class="py-12 bg-white border-t border-gray-200">
  <div class="max-w-6xl mx-auto px-4">
    <div class="text-center mb-8">
      <h3 class="text-xl font-extrabold text-gray-900">Paga y recibe como prefieras</h3>
      <p class="text-xs text-gray-500 mt-1">Transacciones 100% protegidas y envíos con trazabilidad en vivo a todo el país.</p>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
        <span class="text-2xl mb-2 inline-block">💳</span>
        <h4 class="font-bold text-sm text-gray-900">Paga con Tarjeta o Billetera Digital</h4>
        <p class="text-xs text-gray-500 mt-1">Visa, Mastercard, American Express, Yape, Plin y transferencia bancaria directa.</p>
      </div>
      <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
        <span class="text-2xl mb-2 inline-block">📅</span>
        <h4 class="font-bold text-sm text-gray-900">Financia tu Compra a Cuotas</h4>
        <p class="text-xs text-gray-500 mt-1">Paga hasta en 12 cuotas sin intereses con bancos participantes.</p>
      </div>
      <div class="p-5 rounded-2xl bg-gray-50 border border-gray-100 text-center">
        <span class="text-2xl mb-2 inline-block">🚚</span>
        <h4 class="font-bold text-sm text-gray-900">Envíos con Seguimiento en Tiempo Real</h4>
        <p class="text-xs text-gray-500 mt-1">Despacho express el mismo día en Lima y 48h a nivel nacional con Olva y Shalom.</p>
      </div>
    </div>
  </div>
</div>`,
  }
];

const inputCls =
  "w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

const emptyProps = (type: string): Record<string, unknown> => {
  if (type === "form")
    return {
      title: "",
      subtitle: "",
      submit_label: "Enviar",
      success_message: "¡Gracias! Hemos recibido tu mensaje.",
      fields: [
        { label: "Nombre", name: "nombre", type: "text", required: true },
        { label: "Email", name: "email", type: "email", required: true },
      ],
    };
  if (type === "products") return { title: "", category: "", limit: 10 };
  if (type === "banner")
    return { title: "", subtitle: "", image: "", button_text: "", button_link: "", html: "" };
  if (type === "cta")
    return { title: "", subtitle: "", button_text: "", button_link: "" };
  return { html: "", full_width: true };
};

const str = (v: unknown): string => (v == null ? "" : String(v));

function ScaledFrame({
  src,
  baseWidth = 1200,
  height = 760,
}: {
  src: string;
  baseWidth?: number;
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.3);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / baseWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, [baseWidth]);

  return (
    <div ref={ref} className="w-full overflow-hidden bg-white" style={{ height: height * scale }}>
      <iframe
        src={src}
        title="Vista previa del componente"
        className="pointer-events-none border-0"
        style={{ width: baseWidth, height, transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
}

const LOCATIONS = [
  { value: "home", label: "Página de inicio" },
  { value: "tienda", label: "Tienda" },
  { value: "nosotros", label: "Nosotros" },
  { value: "contacto", label: "Contacto" },
];

const isPageLocation = (loc: string) => loc.startsWith("page:");
const pageIdOf = (loc: string) => (isPageLocation(loc) ? Number(loc.slice(5)) : null);

export default function ComponentsManager({ categories }: { categories: string[] }) {
  const [components, setComponents] = useState<ComponentItem[]>([]);
  const [location, setLocation] = useState("home");
  const [locIds, setLocIds] = useState<number[]>([]);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<{
    id: number;
    name: string;
    type: string;
    props: Record<string, unknown>;
    is_active: number;
    is_hidden: number;
  } | null>(null);
  const [viewingSubs, setViewingSubs] = useState<ComponentItem | null>(null);
  const [subs, setSubs] = useState<{ id: number; data: Record<string, unknown>; created_at: string }[]>([]);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<{ name: string; url: string }[]>([]);
  const [bannerMode, setBannerMode] = useState<"form" | "code">("form");
  const [codeTab, setCodeTab] = useState<"code" | "preview">("code");

  const selectedPageId = pageIdOf(location);
  const selectedPage = selectedPageId != null ? pages.find((p) => p.id === selectedPageId) : undefined;
  const currentIds = selectedPageId != null ? (selectedPage?.components ?? []) : locIds;

  async function load() {
    const [compRes, pagesRes] = await Promise.all([
      fetch("/api/components"),
      fetch("/api/pages"),
    ]);
    if (compRes.ok) setComponents(await compRes.json());
    if (pagesRes.ok) setPages(await pagesRes.json());
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetch("/api/components"), fetch("/api/pages")])
      .then(async ([compRes, pagesRes]) => {
        const [comps, pgs] = await Promise.all([compRes.json(), pagesRes.json()]);
        if (cancelled) return;
        setComponents(comps);
        setPages(pgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isPageLocation(location)) return;
    let cancelled = false;
    fetch(`/api/page-components?location=${location}`)
      .then((res) => res.json())
      .then((ids) => {
        if (cancelled) return;
        setLocIds(ids);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [location]);

  async function saveLocIds(ids: number[]) {
    const pid = pageIdOf(location);
    if (pid != null) {
      const page = pages.find((p) => p.id === pid);
      if (page) {
        setPages((prev) => prev.map((p) => (p.id === pid ? { ...p, components: ids } : p)));
        await fetch(`/api/pages/${pid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...page, components: ids }),
        });
      }
      return;
    }
    setLocIds(ids);
    await fetch("/api/page-components", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ location, ids }),
    });
  }

  function toggleLoc(c: ComponentItem) {
    const next = currentIds.includes(c.id)
      ? currentIds.filter((id) => id !== c.id)
      : [...currentIds, c.id];
    saveLocIds(next);
  }

  function moveLoc(id: number, dir: -1 | 1) {
    const idx = currentIds.indexOf(id);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= currentIds.length) return;
    const next = [...currentIds];
    const [item] = next.splice(idx, 1);
    next.splice(target, 0, item);
    saveLocIds(next);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const isNew = editing.id === 0;
    const url = isNew ? "/api/components" : `/api/components/${editing.id}`;
    const res = await fetch(url, {
      method: isNew ? "POST" : "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editing),
    });
    if (res.ok) {
      notify(isNew ? "Componente creado" : "Componente guardado", "success");
      setEditing(null);
      load();
      window.dispatchEvent(new Event("cms:reload-preview"));
    } else {
      notify("Error al guardar", "error");
    }
  }

  async function remove(c: ComponentItem) {
    if (
      !(await confirmAction(`¿Eliminar el componente "${c.name}"?`, { confirmText: "Eliminar" }))
    )
      return;
    const res = await fetch(`/api/components/${c.id}`, { method: "DELETE" });
    if (res.ok) {
      notify("Componente eliminado", "success");
      load();
    } else {
      notify("Error al eliminar", "error");
    }
  }

  async function toggleActive(c: ComponentItem) {
    const res = await fetch(`/api/components/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, is_active: c.is_active ? 0 : 1 }),
    });
    if (res.ok) {
      load();
      window.dispatchEvent(new Event("cms:reload-preview"));
    }
  }

  async function toggleHidden(c: ComponentItem) {
    const res = await fetch(`/api/components/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, is_hidden: c.is_hidden ? 0 : 1 }),
    });
    if (res.ok) {
      load();
      window.dispatchEvent(new Event("cms:reload-preview"));
    }
  }

  async function viewSubmissions(c: ComponentItem) {
    setViewingSubs(c);
    const res = await fetch(`/api/components/${c.id}/submissions`);
    if (res.ok) setSubs(await res.json());
  }

  function setProp(key: string, value: unknown) {
    setEditing((e) => (e ? { ...e, props: { ...e.props, [key]: value } } : e));
  }

  function setField(idx: number, key: keyof Field, value: unknown) {
    setEditing((e) => {
      if (!e) return e;
      const fields = Array.isArray(e.props.fields) ? [...e.props.fields] : [];
      fields[idx] = { ...fields[idx], [key]: value };
      return { ...e, props: { ...e.props, fields } };
    });
  }

  async function toggleMedia() {
    setMediaOpen((o) => !o);
    if (!mediaOpen) {
      const res = await fetch("/api/media");
      if (res.ok) setMediaItems(await res.json());
    }
  }

  function insertImage(url: string) {
    setEditing((e) => {
      if (!e) return e;
      const current = str(e.props.html);
      return {
        ...e,
        props: { ...e.props, html: `${current}${current ? "\n" : ""}<img src="${url}" alt="">` },
      };
    });
  }

  const inLoc = components.filter((c) => currentIds.includes(c.id));

  if (loading) return <p className="text-gray-500">Cargando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{components.length} componente(s)</p>
        <button
          onClick={() =>
            setEditing({ id: 0, name: "", type: "banner", props: emptyProps("banner"), is_active: 1, is_hidden: 0 })
          }
          className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition"
        >
          + Nuevo componente
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Mostrar en una página</h2>
          <p className="text-xs text-gray-400">
            Elige la página y marca los componentes a mostrar.
          </p>
        </div>
        <select
          className="w-full sm:w-64 border border-gray-200 rounded-xl px-3 py-2.5 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        >
          <optgroup label="Páginas principales">
            {LOCATIONS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </optgroup>
          {pages.length > 0 && (
            <optgroup label="Páginas del CMS">
              {pages.map((p) => (
                <option key={`page:${p.id}`} value={`page:${p.id}`}>
                  {p.title}
                </option>
              ))}
            </optgroup>
          )}
        </select>
        <p className="text-xs text-gray-500">
          Las páginas del CMS (creadas en «Páginas») también aparecen aquí. También puedes
          asignar componentes desde el editor de cada página.
        </p>
        {inLoc.length === 0 ? (
          <p className="text-sm text-gray-400">Ningún componente en esta página.</p>
        ) : (
          <div className="space-y-2">
            {currentIds.map((id) => {
              const c = components.find((x) => x.id === id);
              if (!c) return null;
              return (
                <div key={id} className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => moveLoc(id, -1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↑</button>
                    <button onClick={() => moveLoc(id, 1)} className="text-gray-500 hover:text-gray-900 text-sm leading-none">↓</button>
                  </div>
                  <span className="flex-1 text-sm font-medium text-gray-800">{c.name}</span>
                  <span className="text-xs text-gray-400 uppercase">{c.type}</span>
                  <button onClick={() => toggleLoc(c)} className="text-sm text-rose-600 hover:text-rose-800">Quitar</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {components.map((c) => {
          const meta = TYPE_META[c.type] ?? TYPE_META.html;
          return (
            <div
              key={c.id}
              className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5 transition-all flex flex-col overflow-hidden"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${meta.gradient} text-white flex items-center justify-center shadow-md`}
                  >
                    <TypeIcon type={c.type} className="w-6 h-6" />
                  </span>
                  <div className="shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-xs font-medium rounded-full px-2.5 py-1 ${
                        c.is_active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {c.is_active ? "Activo" : "Inactivo"}
                    </span>
                    {c.is_hidden === 1 && (
                      <span className="text-xs font-medium rounded-full px-2.5 py-1 bg-amber-100 text-amber-700">
                        Oculto
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 truncate" title={c.name}>
                  {c.name}
                </h3>
                <p className="text-xs uppercase tracking-wide text-gray-400 mt-0.5">
                  {meta.label}
                </p>
                <div className="mt-3 rounded-xl border border-gray-100 overflow-hidden bg-gray-50">
                  <ScaledFrame src={`/preview/component/${c.id}`} />
                </div>
                <button
                  onClick={() => toggleLoc(c)}
                  className={`mt-3 w-full py-2 rounded-xl text-sm font-medium transition ${
                    currentIds.includes(c.id)
                      ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      : "bg-blue-600 text-white hover:bg-blue-500"
                  }`}
                >
                  {currentIds.includes(c.id)
                    ? "✓ Agregado — quitar de la página"
                    : "Agregar a esta página"}
                </button>
              </div>
              <div className="border-t border-gray-100 flex items-stretch divide-x divide-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setEditing({ ...c, props: { ...c.props } })}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  Editar
                </button>
                <button
                  onClick={() => toggleActive(c)}
                  className="flex-1 py-2.5 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                >
                  {c.is_active ? "Desactivar" : "Activar"}
                </button>
                <button
                  onClick={() => toggleHidden(c)}
                  className="flex-1 py-2.5 text-sm font-medium text-amber-600 hover:bg-amber-50 transition"
                >
                  {c.is_hidden === 1 ? "Mostrar" : "Ocultar"}
                </button>
                {c.type === "form" && (
                  <button
                    onClick={() => viewSubmissions(c)}
                    className="flex-1 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 transition"
                  >
                    Envíos
                  </button>
                )}
                <button
                  onClick={() => remove(c)}
                  className="flex-1 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition"
                >
                  Eliminar
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={() =>
            setEditing({ id: 0, name: "", type: "banner", props: emptyProps("banner"), is_active: 1, is_hidden: 0 })
          }
          className="min-h-[180px] rounded-2xl border-2 border-dashed border-gray-300 text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50/50 transition flex flex-col items-center justify-center gap-2"
        >
          <span className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-2xl leading-none">
            +
          </span>
          <span className="text-sm font-medium">Nuevo componente</span>
        </button>
      </div>

      {components.length === 0 && (
        <p className="text-gray-500 py-8 text-center">No hay componentes. Crea uno para usarlo.</p>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form
            onSubmit={save}
            className={`bg-white rounded-3xl shadow-xl p-6 w-full space-y-4 max-h-[90vh] overflow-y-auto ${
              editing.type === "html" || (editing.type === "banner" && bannerMode === "code")
                ? "max-w-4xl"
                : "max-w-xl"
            }`}
          >
            <h2 className="font-semibold text-gray-900 text-lg">
              {editing.id === 0 ? "Nuevo componente" : "Editar componente"}
            </h2>
            <div>
              <label className={labelCls}>Nombre</label>
              <input className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Tipo</label>
              <select
                className={inputCls}
                value={editing.type}
                onChange={(e) => {
                  const type = e.target.value;
                  setEditing({ ...editing, type, props: emptyProps(type) });
                }}
              >
                <optgroup label="Interactivo (formulario)">
                  {TYPES.filter((t) => t.group === "interactive").map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
                <optgroup label="Usando código">
                  {TYPES.filter((t) => t.group === "code").map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {editing.type === "banner" && (
              <>
                <div className="grid grid-cols-2 gap-1 rounded-xl bg-gray-100 p-1">
                  <button
                    type="button"
                    onClick={() => setBannerMode("form")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      bannerMode === "form" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    Formulario
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerMode("code")}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      bannerMode === "code" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                    }`}
                  >
                    Código
                  </button>
                </div>

                {bannerMode === "code" ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className={labelCls}>HTML personalizado</label>
                      <button
                        type="button"
                        onClick={toggleMedia}
                        className="text-sm bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg px-3 py-1 transition"
                      >
                        {mediaOpen ? "Cerrar" : "Insertar imagen de Multimedia"}
                      </button>
                    </div>
                    {mediaOpen && (
                      <div className="mb-2 max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
                        {mediaItems.length === 0 ? (
                          <p className="text-xs text-gray-400 py-2 text-center">
                            No hay imágenes en Multimedia. Sube algunas primero.
                          </p>
                        ) : (
                          <div className="grid grid-cols-6 gap-2">
                            {mediaItems.map((m) => (
                              <button
                                key={m.name}
                                type="button"
                                onClick={() => insertImage(m.url)}
                                title={`Insertar ${m.name}`}
                                className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-blue-300 bg-white"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    <textarea
                      className={inputCls + " font-mono text-sm"}
                      rows={8}
                      spellCheck={false}
                      value={str(editing.props.html)}
                      onChange={(e) => setProp("html", e.target.value)}
                    />
                  </div>
                ) : (
                  <>
                    <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                    <div><label className={labelCls}>Subtítulo</label><input className={inputCls} value={str(editing.props.subtitle)} onChange={(e) => setProp("subtitle", e.target.value)} /></div>
                    <div>
                      <label className={labelCls}>Imagen</label>
                      <ImagePicker value={str(editing.props.image)} onChange={(url) => setProp("image", url)} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><label className={labelCls}>Texto del botón</label><input className={inputCls} value={str(editing.props.button_text)} onChange={(e) => setProp("button_text", e.target.value)} /></div>
                      <div><label className={labelCls}>Enlace del botón</label><input className={inputCls} value={str(editing.props.button_link)} onChange={(e) => setProp("button_link", e.target.value)} /></div>
                    </div>
                  </>
                )}
              </>
            )}

            {editing.type === "cta" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div><label className={labelCls}>Subtítulo</label><input className={inputCls} value={str(editing.props.subtitle)} onChange={(e) => setProp("subtitle", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Texto del botón</label><input className={inputCls} value={str(editing.props.button_text)} onChange={(e) => setProp("button_text", e.target.value)} /></div>
                  <div><label className={labelCls}>Enlace del botón</label><input className={inputCls} value={str(editing.props.button_link)} onChange={(e) => setProp("button_link", e.target.value)} /></div>
                </div>
              </>
            )}

            {editing.type === "html" && (
              <div className="space-y-3">
                {/* Header de la consola de desarrollo de código */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
                    <button
                      type="button"
                      onClick={() => setCodeTab("code")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        codeTab === "code"
                          ? "bg-white text-gray-900 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      &lt;/&gt; Editor de Código
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodeTab("preview")}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                        codeTab === "preview"
                          ? "bg-white text-blue-600 shadow-xs"
                          : "text-gray-500 hover:text-gray-900"
                      }`}
                    >
                      👁️ Vista Previa en Vivo
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Selector de Plantillas Pro */}
                    <select
                      className="text-xs border border-gray-200 rounded-xl px-2.5 py-1.5 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue=""
                      onChange={(e) => {
                        const tId = e.target.value;
                        if (!tId) return;
                        const t = CODE_TEMPLATES.find((x) => x.id === tId);
                        if (t) {
                          setProp("html", t.code);
                          notify(`Plantilla "${t.label}" insertada`, "success");
                        }
                        e.target.value = "";
                      }}
                    >
                      <option value="" disabled>
                        ⚡ Insertar plantilla de código…
                      </option>
                      {CODE_TEMPLATES.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={toggleMedia}
                      className="text-xs bg-gray-100 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-xl px-3 py-1.5 transition font-medium"
                    >
                      {mediaOpen ? "Cerrar Multimedia" : "📷 Multimedia"}
                    </button>
                  </div>
                </div>

                {/* Galería de multimedia si está abierta */}
                {mediaOpen && (
                  <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 bg-gray-50 p-2">
                    {mediaItems.length === 0 ? (
                      <p className="text-xs text-gray-400 py-2 text-center">
                        No hay imágenes en Multimedia. Sube algunas primero.
                      </p>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        {mediaItems.map((m) => (
                          <button
                            key={m.name}
                            type="button"
                            onClick={() => insertImage(m.url)}
                            title={`Insertar ${m.name}`}
                            className="aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-blue-300 bg-white"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={m.url} alt={m.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Pestaña: Editor de Código */}
                {codeTab === "code" ? (
                  <div className="space-y-2">
                    <div className="relative rounded-2xl overflow-hidden border border-gray-900 bg-[#0d1117] shadow-inner">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 bg-[#161b22] text-xs text-gray-400 font-mono">
                        <span className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                          <span className="ml-2 text-gray-300 font-semibold">custom-section.html</span>
                        </span>
                        <span>HTML + CSS Tailwind + &lt;script&gt;</span>
                      </div>
                      <textarea
                        className="w-full bg-[#0d1117] text-[#c9d1d9] font-mono text-xs sm:text-sm p-4 focus:outline-none focus:ring-0 resize-y leading-relaxed"
                        rows={14}
                        spellCheck={false}
                        value={str(editing.props.html)}
                        onChange={(e) => setProp("html", e.target.value)}
                        placeholder="<!-- Escribe tu HTML, clases de Tailwind, o scripts <script> interactivos -->"
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>💡 Soporta clases Tailwind, estilos &lt;style&gt; aislados y scripts interactivos.</span>
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-gray-700">
                        <input
                          type="checkbox"
                          checked={Boolean(editing.props.full_width ?? true)}
                          onChange={(e) => setProp("full_width", e.target.checked)}
                          className="w-4 h-4 rounded accent-blue-600"
                        />
                        <span>Ancho Completo (Full Width)</span>
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Pestaña: Vista Previa en Vivo */
                  <div className="rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-xs">
                    <div className="px-4 py-2 bg-gray-100 border-b border-gray-200 text-xs font-semibold text-gray-600 flex items-center justify-between">
                      <span>● Vista Previa Interactiva en Tiempo Real</span>
                      <span className="text-[11px] text-gray-400">Los scripts y estilos están activos</span>
                    </div>
                    <div className="p-4 max-h-[500px] overflow-y-auto">
                      {str(editing.props.html).trim() ? (
                        <HtmlBlock html={str(editing.props.html)} />
                      ) : (
                        <p className="text-sm text-gray-400 text-center py-12">
                          El editor de código está vacío. Escribe algo o inserta una plantilla para previsualizarlo.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {editing.type === "products" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div>
                  <label className={labelCls}>Categoría (opcional)</label>
                  <select className={inputCls} value={str(editing.props.category)} onChange={(e) => setProp("category", e.target.value)}>
                    <option value="">Todas las categorías</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className={labelCls}>Precio Mín. (opcional)</label>
                    <input type="number" className={inputCls} placeholder="ej. 50" value={str(editing.props.min)} onChange={(e) => setProp("min", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Precio Máx. (opcional)</label>
                    <input type="number" className={inputCls} placeholder="ej. 200" value={str(editing.props.max)} onChange={(e) => setProp("max", e.target.value)} />
                  </div>
                  <div>
                    <label className={labelCls}>Cantidad máx.</label>
                    <input type="number" className={inputCls} value={Number(editing.props.limit ?? 10)} onChange={(e) => setProp("limit", Number(e.target.value))} />
                  </div>
                </div>
              </>
            )}

            {editing.type === "form" && (
              <>
                <div><label className={labelCls}>Título</label><input className={inputCls} value={str(editing.props.title)} onChange={(e) => setProp("title", e.target.value)} /></div>
                <div><label className={labelCls}>Subtítulo</label><input className={inputCls} value={str(editing.props.subtitle)} onChange={(e) => setProp("subtitle", e.target.value)} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className={labelCls}>Texto del botón</label><input className={inputCls} value={str(editing.props.submit_label ?? "Enviar")} onChange={(e) => setProp("submit_label", e.target.value)} /></div>
                  <div><label className={labelCls}>Mensaje de éxito</label><input className={inputCls} value={str(editing.props.success_message)} onChange={(e) => setProp("success_message", e.target.value)} /></div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={labelCls}>Campos</label>
                    <button type="button" onClick={() => setProp("fields", [...(Array.isArray(editing.props.fields) ? editing.props.fields : []), { label: "", name: "", type: "text", required: false }])} className="text-sm bg-gray-900 text-white rounded-lg px-3 py-1 hover:bg-gray-700">+ Campo</button>
                  </div>
                  <div className="space-y-2">
                    {(Array.isArray(editing.props.fields) ? editing.props.fields : []).map((f: Field, i: number) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input className={inputCls} placeholder="Etiqueta" value={f.label ?? ""} onChange={(e) => setField(i, "label", e.target.value)} />
                        <input className={inputCls} placeholder="Nombre" value={f.name ?? ""} onChange={(e) => setField(i, "name", e.target.value)} />
                        <select className={inputCls} value={f.type ?? "text"} onChange={(e) => setField(i, "type", e.target.value)}>
                          <option value="text">Texto</option>
                          <option value="email">Email</option>
                          <option value="tel">Teléfono</option>
                          <option value="textarea">Área de texto</option>
                        </select>
                        <button type="button" onClick={() => setProp("fields", (Array.isArray(editing.props.fields) ? editing.props.fields : []).filter((_, idx) => idx !== i))} className="text-red-600 hover:text-red-800 px-1">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.is_active === 1} onChange={(e) => setEditing({ ...editing, is_active: e.target.checked ? 1 : 0 })} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700">Activo</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={editing.is_hidden === 1} onChange={(e) => setEditing({ ...editing, is_hidden: e.target.checked ? 1 : 0 })} className="w-4 h-4 rounded accent-blue-600" />
              <span className="text-sm text-gray-700">Ocultar del sitio</span>
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-900">Cancelar</button>
              <button type="submit" className="bg-gradient-to-r from-blue-600 to-sky-600 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:from-blue-500 hover:to-sky-500 transition">Guardar</button>
            </div>
          </form>
        </div>
      )}

      {viewingSubs && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setViewingSubs(null)}>
          <div className="bg-white rounded-3xl shadow-xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Envíos · {viewingSubs.name}</h2>
              <button onClick={() => setViewingSubs(null)} className="text-gray-500 hover:text-gray-900">✕</button>
            </div>
            {subs.length === 0 ? (
              <p className="text-sm text-gray-400">No hay envíos todavía.</p>
            ) : (
              <div className="space-y-2">
                {subs.map((s) => (
                  <div key={s.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                    <p className="text-xs text-gray-400 mb-1">{new Date(s.created_at).toLocaleString()}</p>
                    <dl className="space-y-1">
                      {Object.entries(s.data).map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                          <dt className="font-medium text-gray-600">{k}:</dt>
                          <dd className="text-gray-800 break-all">{String(v)}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
