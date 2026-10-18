import mysql from "mysql2/promise";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadEnv() {
  const file = path.join(root, ".env");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !(match[1] in process.env)) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

loadEnv();

async function seed() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "cms",
    multipleStatements: true,
  });

  console.log("Conectado a MySQL para sembrar tienda completa...");

  // 1. Settings
  await conn.query(`
    INSERT INTO cms_settings (\`key\`, \`value\`) VALUES
      ('site_title', 'NOVA TECH · Premium Store & Studio'),
      ('site_description', 'Tienda especializada en tecnología de vanguardia, audio de alta resolución y equipamiento de setup premium.'),
      ('whatsapp', '+51987654321'),
      ('currency', 'S/. '),
      ('theme_color', 'indigo'),
      ('theme_primary', '#4f46e5'),
      ('theme_primary_light', '#6366f1'),
      ('theme_primary_dark', '#4338ca'),
      ('theme_primary_soft', '#eef2ff'),
      ('store_page_size', '12')
    ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`);
  `);

  // 2. Header
  const navItems = JSON.stringify([
    { label: "Inicio", href: "/" },
    { label: "Tienda", href: "/tienda" },
    { label: "Audio", href: "/tienda?category=Audio%20%26%20Sonido" },
    { label: "Gaming & Setup", href: "/tienda?category=Gaming%20%26%20Setup" },
    { label: "Nosotros", href: "/nosotros" },
    { label: "Contacto", href: "/contacto" },
  ]);

  const socialLinks = JSON.stringify([
    { label: "Instagram", url: "https://instagram.com" },
    { label: "TikTok", url: "https://tiktok.com" },
    { label: "YouTube", url: "https://youtube.com" },
    { label: "WhatsApp", url: "https://wa.me/51987654321" },
  ]);

  await conn.query(`
    UPDATE cms_header SET
      site_name = 'NOVA TECH',
      logo_text = 'NOVA TECH',
      phone = '+51 987 654 321',
      email = 'ventas@novatech.pe',
      show_topbar = 1,
      show_store_button = 1,
      sticky = 1,
      nav_items = ?,
      social_links = ?
    WHERE id = 1;
  `, [navItems, socialLinks]);

  // 3. Footer
  await conn.query(`
    UPDATE cms_footer SET
      about_text = 'Somos NOVA TECH, tu destino de referencia para tecnología de alta gama, audio profesional y accesorios de diseño para creadores y entusiastas del buen rendimiento.',
      address = 'Av. Primavera 1050, San Borja, Lima, Perú',
      phone = '+51 987 654 321',
      email = 'contacto@novatech.pe',
      copyright = '© 2026 NOVA TECH Studio. Todos los derechos reservados.',
      social_links = ?
    WHERE id = 1;
  `, [socialLinks]);

  // 4. Banners
  await conn.query("DELETE FROM cms_banners WHERE provider_id IS NULL");
  await conn.query(`
    INSERT INTO cms_banners (title, subtitle, image, image_position, text_position, button_text, button_link, is_active, sort_order)
    VALUES
      (
        'Sony WH-1000XM5 Hi-Res Audio',
        'Cancelación de ruido líder en el mundo con 8 micrófonos y procesador V1 dedicado. Vive una experiencia acústica inmersiva.',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        'right',
        'left',
        'Explorar Audio',
        '/tienda?category=Audio%20%26%20Sonido',
        1,
        1
      ),
      (
        'Teclados Mecánicos Custom & Setup',
        'Chasis de aluminio CNC, switches lubricados de fábrica y conectividad inalámbrica triple modo para elevar tu productividad.',
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
        'left',
        'right',
        'Ver Setup & Gaming',
        '/tienda?category=Gaming%20%26%20Setup',
        1,
        2
      ),
      (
        'Apple Watch Ultra 2 · Titanium 49mm',
        'Caja de titanio de grado aeroespacial, pantalla Retina OLED de hasta 3000 nits y chip S9 SiP con doble toque para expediciones extremas.',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80',
        'right',
        'left',
        'Explorar Smart Tech',
        '/tienda?category=Smart%20Tech%20%26%20Wearables',
        1,
        3
      );
  `);

  // 5. Categorías
  await conn.query("DELETE FROM cms_categories WHERE provider_id IS NULL");
  await conn.query(`
    INSERT INTO cms_categories (name, slug, description, is_active, is_hidden)
    VALUES
      ('Audio & Sonido', 'audio-y-sonido', 'Audífonos inalámbricos, parlantes Hi-Fi y micrófonos de estudio profesional.', 1, 0),
      ('Smart Tech & Wearables', 'smart-tech-y-wearables', 'Relojes inteligentes, bandas de actividad y gadgets de salud conectada.', 1, 0),
      ('Gaming & Setup', 'gaming-y-setup', 'Teclados mecánicos, ratones ergonómicos y barras de luz para escritorios.', 1, 0),
      ('Accesorios & Carga', 'accesorios-y-carga', 'Estaciones de carga MagSafe, powerbanks de alta potencia y cables reforzados.', 1, 0);
  `);

  // 6. Productos
  await conn.query("DELETE FROM cms_products WHERE provider_id IS NULL");
  await conn.query(`
    INSERT INTO cms_products (name, slug, sku, description, price, image, category, brand, stock, is_active, is_hidden, sort_order)
    VALUES
      (
        'Sony WH-1000XM5 Wireless Noise Cancelling',
        'sony-wh-1000xm5',
        'SNY-XM5-BLK',
        'Audífonos premium over-ear con dos procesadores para cancelación de ruido insuperable, 30 horas de batería y llamadas ultranítidas con 4 micrófonos beamforming.',
        1399.90,
        'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
        'Audio & Sonido',
        'Sony',
        14,
        1,
        0,
        1
      ),
      (
        'Apple AirPods Max Space Gray',
        'apple-airpods-max',
        'APL-AIRPODS-MAX',
        'Diadema de malla transpirable, almohadillas viscoelásticas, transductor dinámico de 40 mm diseñado por Apple y Audio Espacial con seguimiento dinámico.',
        2299.00,
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
        'Audio & Sonido',
        'Apple',
        8,
        1,
        0,
        2
      ),
      (
        'Keychron Q1 Pro Wireless Custom Mechanical',
        'keychron-q1-pro-wireless',
        'KEY-Q1-PRO',
        'Teclado mecánico 75% QMK/VIA con cuerpo de aluminio maquinado por CNC, conectividad Bluetooth 5.1 y cable USB-C, switches Banana y keycaps PBT KSA.',
        789.00,
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
        'Gaming & Setup',
        'Keychron',
        12,
        1,
        0,
        3
      ),
      (
        'Logitech MX Master 3S Performance Wireless',
        'logitech-mx-master-3s',
        'LOG-MX-3S',
        'Mouse ergonómico para creadores con sensor Darkfield de 8000 DPI para trabajar sobre cualquier superficie (incluso cristal) y clics 90% más silenciosos.',
        399.90,
        'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
        'Gaming & Setup',
        'Logitech',
        25,
        1,
        0,
        4
      ),
      (
        'Apple Watch Ultra 2 GPS + Cellular 49mm',
        'apple-watch-ultra-2',
        'APL-WATCH-U2',
        'El reloj de aventura definitivo con pantalla Retina siempre activa de hasta 3000 nits, chip S9 SiP, gesto de doble toque y resistencia al agua hasta 100m.',
        3499.00,
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'Smart Tech & Wearables',
        'Apple',
        6,
        1,
        0,
        5
      ),
      (
        'Samsung Galaxy Watch 6 Classic 47mm',
        'samsung-galaxy-watch-6-classic',
        'SAM-GW6-CLS',
        'Bisel giratorio físico icónico, cristal de zafiro ultrarresistente, sensor BioActive 3 en 1 para composición corporal, ECG y monitoreo de sueño avanzado.',
        1249.90,
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
        'Smart Tech & Wearables',
        'Samsung',
        9,
        1,
        0,
        6
      ),
      (
        'Marshall Stanmore III Bluetooth Speaker',
        'marshall-stanmore-iii',
        'MSH-STAN-3',
        'Sonido legendario de escenario para el hogar. Agudos nítidos, medios vivos y graves profundos que llenan cualquier habitación con estética vintage inconfundible.',
        1599.00,
        'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
        'Audio & Sonido',
        'Marshall',
        5,
        1,
        0,
        7
      ),
      (
        'BenQ ScreenBar Halo Wireless Controller LED',
        'benq-screenbar-halo',
        'BNQ-SB-HALO',
        'Lámpara de monitor inteligente con control inalámbrico, retroiluminación ambiental suave y óptica patentada sin reflejos molestos en la pantalla.',
        649.90,
        'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
        'Gaming & Setup',
        'BenQ',
        15,
        1,
        0,
        8
      ),
      (
        'Anker Prime 27,650mAh Power Bank 250W',
        'anker-prime-250w-powerbank',
        'ANK-PRIME-250W',
        'Batería externa portátil capaz de cargar hasta dos laptops simultáneamente a máxima velocidad gracias a sus 250W combinados y pantalla a color con telemetría en vivo.',
        589.00,
        'https://images.unsplash.com/photo-1609592424368-8798bf13d395?auto=format&fit=crop&w=800&q=80',
        'Accesorios & Carga',
        'Anker',
        18,
        1,
        0,
        9
      ),
      (
        'Nomad Base One Max MagSafe 3-in-1',
        'nomad-base-one-max',
        'NMD-B1-MAX',
        'Estación de carga inalámbrica de metal macizo y cristal pulido de 1 kg de peso. Carga oficial MagSafe de 15W para iPhone, Apple Watch y estuche AirPods.',
        499.00,
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80',
        'Accesorios & Carga',
        'Nomad',
        10,
        1,
        0,
        10
      ),
      (
        'Shure SM7B Micrófono Dinámico Cardioide',
        'shure-sm7b-microfono',
        'SHR-SM7B',
        'El estándar de la industria musical, podcasts y transmisiones en vivo. Respuesta suave y balanceada con excelente rechazo del ruido de fondo.',
        1699.00,
        'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80',
        'Audio & Sonido',
        'Shure',
        7,
        1,
        0,
        11
      ),
      (
        'Elgato Stream Deck MK.2 White Edition',
        'elgato-stream-deck-mk2',
        'ELG-SD-MK2W',
        'Consola con 15 teclas LCD personalizables para disparar acciones en streaming, automatizar programas, controlar luces y mezclar audio con un solo toque.',
        629.90,
        'https://images.unsplash.com/photo-1616469829941-c7200edec809?auto=format&fit=crop&w=800&q=80',
        'Gaming & Setup',
        'Elgato',
        11,
        1,
        0,
        12
      );
  `);

  // 7. Componentes dinámicos reutilizables en la portada
  await conn.query("DELETE FROM cms_components WHERE provider_id IS NULL");

  // A. Bloque de Beneficios / Trust Badges (HTML)
  const [c1] = await conn.query(`
    INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden)
    VALUES (
      NULL,
      'Bloque de Beneficios y Garantías',
      'html',
      ?,
      1,
      0
    );
  `, [JSON.stringify({
    html: `
      <div class="py-12 bg-gray-50 border-y border-gray-100">
        <div class="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div class="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <span class="text-3xl mb-3">🚀</span>
            <h4 class="font-bold text-gray-900 text-sm">Envíos Express 24h</h4>
            <p class="text-xs text-gray-500 mt-1">Despachos diarios a todo el país con seguimiento en tiempo real.</p>
          </div>
          <div class="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <span class="text-3xl mb-3">🛡️</span>
            <h4 class="font-bold text-gray-900 text-sm">Garantía Oficial</h4>
            <p class="text-xs text-gray-500 mt-1">12 meses de garantía directa por falla de fábrica en todos los equipos.</p>
          </div>
          <div class="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <span class="text-3xl mb-3">💳</span>
            <h4 class="font-bold text-gray-900 text-sm">Pago 100% Seguro</h4>
            <p class="text-xs text-gray-500 mt-1">Aceptamos transferencias, tarjetas de crédito y pago contra entrega.</p>
          </div>
          <div class="flex flex-col items-center p-4 rounded-2xl bg-white border border-gray-100 shadow-xs">
            <span class="text-3xl mb-3">💬</span>
            <h4 class="font-bold text-gray-900 text-sm">Soporte VIP WhatsApp</h4>
            <p class="text-xs text-gray-500 mt-1">Asesoría técnica personalizada antes y después de tu compra.</p>
          </div>
        </div>
      </div>
    `
  })]);

  // B. Bento Grid de Innovación y Setup (HTML / Código personalizado Full Width)
  const [c2] = await conn.query(`
    INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden)
    VALUES (
      NULL,
      'Bento Grid de Rendimiento Extremo',
      'html',
      ?,
      1,
      0
    );
  `, [JSON.stringify({
    full_width: true,
    html: `
      <div data-full-width="true" class="py-16 bg-[#080b14] text-white">
        <div class="max-w-6xl mx-auto px-4">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <span class="text-xs font-bold uppercase tracking-[0.25em] text-indigo-400 border border-indigo-500/30 px-3 py-1 rounded-full bg-indigo-500/10">Ingeniería de Élite</span>
            <h2 class="text-3xl sm:text-4xl font-black mt-4 tracking-tight">Diseñado para el Rendimiento Extremo</h2>
            <p class="text-gray-400 mt-3 text-sm sm:text-base">Componentes calibrados al milímetro para creadores, audiófilos y setups de alto nivel.</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="md:col-span-2 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-indigo-500/50 transition-all">
              <div class="relative z-10">
                <span class="text-3xl">🎧</span>
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
              <span class="text-3xl">⚡</span>
              <h3 class="text-xl font-bold mt-4">Carga GaN III 250W</h3>
              <p class="text-gray-300 mt-2 text-xs">Hasta 3 dispositivos al 100% simultáneamente con telemetría en pantalla a color.</p>
              <div class="mt-6 text-3xl font-black text-amber-400">18 min <span class="text-xs text-gray-400 font-normal">al 50%</span></div>
            </div>
            <div class="rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <span class="text-3xl">⌨️</span>
              <h3 class="text-xl font-bold mt-4">CNC Anodizado 6063</h3>
              <p class="text-gray-300 mt-2 text-xs">Tolerancia milimétrica, montaje gasket mount y switches mecánicos pre-lubricados.</p>
              <div class="mt-4 text-xs font-mono text-emerald-400">Tolerancia: ±0.01mm</div>
            </div>
            <div class="md:col-span-2 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-8 relative overflow-hidden group hover:border-cyan-500/50 transition-all flex flex-col justify-between">
              <div>
                <span class="text-3xl">⌚</span>
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
      </div>
    `
  })]);

  // C. Comparativa de Ficha Técnica Interactivo (HTML / JS nativo)
  const [c3] = await conn.query(`
    INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden)
    VALUES (
      NULL,
      'Comparativa de Ficha Técnica Interactiva',
      'html',
      ?,
      1,
      0
    );
  `, [JSON.stringify({
    full_width: false,
    html: `
      <div class="py-14 bg-white">
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
      </script>
    `
  })]);

  // D. Muro de Reseñas y Testimonios de Clientes (HTML)
  const [c4] = await conn.query(`
    INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden)
    VALUES (
      NULL,
      'Muro de Reseñas de Clientes Verificados',
      'html',
      ?,
      1,
      0
    );
  `, [JSON.stringify({
    full_width: false,
    html: `
      <div class="py-14 bg-gray-50 border-t border-gray-100">
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
      </div>
    `
  })]);

  // E. Formulario de Contacto y Asesoría en Portada (Form)
  const [c5] = await conn.query(`
    INSERT INTO cms_components (provider_id, name, type, props, is_active, is_hidden)
    VALUES (
      NULL,
      'Formulario de Asesoría Especializada',
      'form',
      ?,
      1,
      0
    );
  `, [JSON.stringify({
    title: "¿Necesitas ayuda para armar tu Setup o Estudio?",
    subtitle: "Déjanos tus datos y un especialista de NOVA TECH te responderá en menos de 1 hora.",
    button_text: "Solicitar Asesoría Gratuita",
    fields: [
      { name: "nombre", label: "Tu nombre completo", type: "text", required: true },
      { name: "whatsapp", label: "Número de WhatsApp", type: "text", required: true },
      { name: "categoria", label: "¿Qué categoría buscas?", type: "text", required: false },
      { name: "mensaje", label: "¿Qué dudas o requerimientos tienes?", type: "textarea", required: true }
    ]
  })]);

  const id1 = c1.insertId;
  const id2 = c2.insertId;
  const id3 = c3.insertId;
  const id4 = c4.insertId;
  const id5 = c5.insertId;

  // Asignar los componentes a la portada en cms_settings ('components_home')
  await conn.query(`
    INSERT INTO cms_settings (\`key\`, \`value\`)
    VALUES ('components_home', ?)
    ON DUPLICATE KEY UPDATE \`value\` = VALUES(\`value\`);
  `, [JSON.stringify([id1, id2, id3, id4, id5])]);

  // 8. Sección Nosotros & Contacto
  await conn.query(`
    INSERT INTO cms_about (id, provider_id, title, subtitle, content, image)
    VALUES (
      1,
      NULL,
      'Pasión por la tecnología y el diseño vanguardista',
      'Construimos el espacio donde la innovación acústica y la estética minimalista convergen.',
      'Fundada en 2024, NOVA TECH nació como respuesta a la necesidad de encontrar periféricos, audífonos de alta resolución y equipamiento para puestos de trabajo con estándares profesionales y garantía real en América Latina.\n\nNos especializamos en seleccionar cuidadosamente cada producto de nuestro catálogo: desde los auriculares con mejor calibración espectral del mercado hasta los teclados custom con chasis de aluminio CNC y switches lubricados a mano.\n\nCreemos firmemente que las herramientas con las que trabajas, creas y juegas todos los días deben inspirarte, durar en el tiempo y ofrecer un desempeño excepcional sin concesiones.',
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      content = VALUES(content),
      image = VALUES(image);
  `);

  await conn.query(`
    INSERT INTO cms_contact (id, provider_id, title, subtitle, address, phone, email, whatsapp, hours, map_url)
    VALUES (
      1,
      NULL,
      'Ponte en contacto con nuestro equipo',
      'Estamos listos para asesorarte con la configuración ideal para tu estudio, oficina o espacio de gaming.',
      'Av. Primavera 1050, Piso 3, San Borja, Lima, Perú',
      '+51 987 654 321',
      'ventas@novatech.pe',
      '+51987654321',
      'Lunes a Viernes: 9:00 AM - 7:00 PM | Sábados: 10:00 AM - 4:00 PM',
      'https://maps.google.com/?q=San+Borja+Lima+Peru'
    )
    ON DUPLICATE KEY UPDATE
      title = VALUES(title),
      subtitle = VALUES(subtitle),
      address = VALUES(address),
      phone = VALUES(phone),
      email = VALUES(email),
      whatsapp = VALUES(whatsapp),
      hours = VALUES(hours),
      map_url = VALUES(map_url);
  `);

  // 9. Páginas personalizadas HTML
  await conn.query("DELETE FROM cms_pages WHERE provider_id IS NULL");
  await conn.query(`
    INSERT INTO cms_pages (provider_id, title, slug, content, is_active)
    VALUES
      (
        NULL,
        'Políticas de Envío y Entregas',
        'politicas-de-envio',
        '<h2>1. Tiempos de Entrega</h2><p>Todos los pedidos realizados antes de las 2:00 PM de lunes a viernes son procesados y despachados el mismo día hábil.</p><ul><li><strong>Lima Metropolitana:</strong> Entrega express en 24 a 48 horas hábiles.</li><li><strong>Provincias y Nacional:</strong> Entrega mediante Olva Courier o Shalom en 48 a 72 horas hábiles.</li></ul><h2>2. Costo del Envío</h2><p>Ofrecemos <strong>envío gratis</strong> en compras superiores a S/. 299 a cualquier punto del país. Para compras menores, la tarifa plana en Lima es de S/. 15 y para provincias S/. 25.</p><h2>3. Seguimiento de Pedido</h2><p>Una vez despachado el paquete, recibirás vía WhatsApp tu número de guía de remisión junto al enlace de seguimiento en vivo.</p>',
        1
      ),
      (
        NULL,
        'Garantía Oficial y Devoluciones',
        'garantia-y-devoluciones',
        '<h2>Garantía de Satisfacción Total</h2><p>En NOVA TECH todos nuestros productos cuentan con garantía de 12 meses contra defectos de manufactura.</p><h3>Condiciones de Devolución</h3><p>Si el producto presenta alguna falla técnica durante los primeros 7 días posteriores a la recepción, realizamos el <strong>cambio inmediato por un producto totalmente nuevo</strong> o el reembolso total de tu dinero.</p><h3>Requisitos</h3><ul><li>Conservar la boleta o factura de compra.</li><li>Mantener los empaques originales, manuales y accesorios completos en buen estado.</li></ul>',
        1
      ),
      (
        NULL,
        'Preguntas Frecuentes (FAQ)',
        'preguntas-frecuentes',
        '<h2>Preguntas Frecuentes</h2><h3>¿Los productos son 100% originales y nuevos?</h3><p>Sí, absolutamente todos nuestros productos son nuevos en caja sellada y adquiridos directamente de los distribuidores oficiales de Sony, Apple, Keychron, Logitech, Shure y Marshall.</p><h3>¿Qué métodos de pago aceptan?</h3><p>Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencias bancarias BCP/BBVA/Interbank, Yape, Plin y pago en efectivo contra entrega en Lima.</p><h3>¿Tienen tienda física para probar los equipos?</h3><p>Contamos con un Showroom en San Borja donde puedes agendar una cita previa por WhatsApp para probar los audífonos y teclados mecánicos antes de comprar.</p>',
        1
      );
  `);

  console.log("¡Sembrado completado con éxito! Se crearon:");
  console.log("- 12 productos de alta gama con imágenes, marcas y SKU");
  console.log("- 4 categorías principales");
  console.log("- 3 banners hero animados con alta resolución");
  console.log("- 3 bloques dinámicos en la portada (HTML beneficios, CTA VIP y Formulario)");
  console.log("- Secciones completas de Nosotros y Contacto con mapa");
  console.log("- 3 páginas institucionales personalizadas (Políticas, Garantía, FAQ)");

  await conn.end();
}

seed().catch((err) => {
  console.error("Error en seeder:", err);
  process.exit(1);
});
