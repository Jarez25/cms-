import Link from "next/link";

function Section({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      <div className="mt-4 space-y-4 text-sm text-gray-700 leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-xl bg-gray-900 p-4 font-mono text-xs text-gray-100 leading-relaxed">
      {children}
    </pre>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
        {n}
      </span>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Documentación</h1>
        <p className="text-gray-500 mt-1">
          Guía rápida para sacarle el máximo provecho al CMS.
        </p>
      </div>

      <nav className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
          Índice
        </p>
        <ul className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
          {[
            ["#alertify", "Alertify (alertas)"],
            ["#productos", "Productos"],
            ["#componentes", "Componentes"],
            ["#paginas", "Páginas"],
            ["#menus", "Menús"],
            ["#banners", "Banners"],
            ["#codigo", "Código"],
            ["#endpoint", "Endpoint"],
            ["#api", "API pública"],
          ].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="block rounded-lg px-3 py-2 text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Section
        id="alertify"
        title="Alertify — notificaciones y diálogos"
        subtitle="Librería de alertas integrable desde la sección Código."
      >
        <p>
          Alertify permite mostrar notificaciones, alertas, confirmaciones y prompts sin salir de la
          página. Se configura una sola vez y queda disponible en todo el sitio.
        </p>
        <p className="font-semibold text-gray-900">1. Agregar la librería (sección Código → CDNs externos)</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-500">Tipo</th>
                <th className="px-3 py-2 font-semibold text-gray-500">URL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">JS</td>
                <td className="px-3 py-2 font-mono break-all">
                  https://cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/alertify.min.js
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">CSS</td>
                <td className="px-3 py-2 font-mono break-all">
                  https://cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/alertify.min.css
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">CSS (tema)</td>
                <td className="px-3 py-2 font-mono break-all">
                  https://cdn.jsdelivr.net/npm/alertifyjs@1.14.0/build/css/themes/default.min.css
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-semibold text-gray-900">2. Escribir las alertas (Código → JavaScript abajo)</p>
        <p>
          El CMS ahora carga los CDNs <strong>antes</strong> de ejecutar tu código de abajo, así que
          puedes usar <code className="font-mono text-blue-600">alertify</code> directamente:
        </p>
        <Code>{`// Notificaciones rápidas (esquina)
alertify.success('Guardado correctamente');
alertify.error('Ocurrió un error');
alertify.warning('Revisa los datos');
alertify.message('Información');

// Notificación con duración (segundos)
alertify.notify('Producto añadido', 'success', 5);

// Diálogos
alertify.alert('Título', 'Mensaje del diálogo');
alertify.confirm('¿Eliminar este producto?', function (e) {
  if (e) alertify.success('Eliminado');
});
alertify.prompt('Tu email', 'por defecto@x.com', function (evt, value) {
  alertify.success('Email: ' + value);
});`}</Code>
        <p>
          Puedes disparar alertas desde cualquier evento, por ejemplo al hacer clic en un botón de
          tu página:
        </p>
        <Code>{`<button onclick="alertify.success('¡Hecho!')">Comprar</button>`}</Code>
        <p className="text-gray-500">
          Nota: no hace falta un <code className="font-mono">setInterval</code> ni esperas manuales.
          El orden de carga ya está garantizado.
        </p>
      </Section>

      <Section
        id="productos"
        title="Productos"
        subtitle="Crear, editar, ocultar y sincronizar el catálogo."
      >
        <p>
          Ve a <Link href="/admin/store" className="text-blue-600 underline">Tienda → Productos</Link>.
          Cada producto tiene nombre, SKU, precio, categoría, marca, imagen, stock, estado y orden.
        </p>
        <div className="space-y-2">
          <Step n={1}>Pulsa <strong>+ Nuevo producto</strong> y rellena los campos.</Step>
          <Step n={2}>Usa <strong>imagen</strong> para subir una foto (se guarda en <code className="font-mono">/uploads</code>).</Step>
          <Step n={3}>Marca <strong>Publicado</strong> para que se vea en la tienda.</Step>
          <Step n={4}>
            Usa <strong>Ocultar</strong> si no quieres que aparezca en el sitio público, o{" "}
            <strong>Borrador</strong> para dejarlo inactivo.
          </Step>
          <Step n={5}>
            Ordena con <strong>orden</strong> (número menor = aparece primero).
          </Step>
        </div>
        <p>
          Los productos también se pueden importar masivamente desde un <strong>Endpoint</strong>{" "}
          (ver sección Endpoint más abajo).
        </p>
      </Section>

      <Section
        id="componentes"
        title="Componentes"
        subtitle="Bloques reutilizables que puedes colocar en el inicio o en páginas."
      >
        <p>
          Ve a <Link href="/admin/components" className="text-blue-600 underline">Componentes</Link>.
          Existen 5 tipos:
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ["Banner (visual)", "Banner con imagen, título, subtítulo y botón. También admite modo Código."],
            ["HTML", "Texto/formato libre. Pega el HTML que quieras renderizar."],
            ["CTA", "Llamada a la acción con título, subtítulo y botón."],
            ["Formulario", "Formulario configurable; los envíos se guardan y se pueden revisar."],
            ["Productos", "Carrusel de productos de una categoría (con límite)."],
          ].map(([name, desc]) => (
            <div key={name} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500 mt-1">{desc}</p>
            </div>
          ))}
        </div>
        <p>
          Cada tarjeta muestra una <strong>vista previa en vivo</strong> de cómo se verá el
          componente en el sitio. Usa <strong>Agregar a esta página</strong> para asignarlo a la
          página seleccionada en «Mostrar en una página» (inicio, tienda, nosotros, contacto o una
          página del CMS). También puedes <strong>Ocultar</strong> un componente sin borrarlo.
        </p>
      </Section>

      <Section
        id="paginas"
        title="Páginas"
        subtitle="Contenido libre (HTML) con su propia ruta."
      >
        <div className="space-y-2">
          <Step n={1}>Ve a <Link href="/admin/pages" className="text-blue-600 underline">Páginas</Link> y crea una.</Step>
          <Step n={2}>Define <strong>título</strong> y <strong>slug</strong> (parte de la URL).</Step>
          <Step n={3}>Escribe el contenido en <strong>HTML</strong>.</Step>
          <Step n={4}>
            Opcionalmente asigna <strong>componentes</strong> que se mostrarán junto al contenido.
          </Step>
        </div>
        <p>
          La página quedará disponible en <code className="font-mono">/pagina/[slug]</code> (o{" "}
          <code className="font-mono">/p/[proveedor]/pagina/[slug]</code>).
        </p>
      </Section>

      <Section
        id="menus"
        title="Menús"
        subtitle="Navegación jerárquica estilo WordPress."
      >
        <p>
          Ve a <Link href="/admin/menus" className="text-blue-600 underline">Header → Menús</Link>.
          Puedes crear varios menús con subniveles (elementos hijos) y luego asignar uno al header
          desde la sección <strong>Header</strong>.
        </p>
      </Section>

      <Section
        id="banners"
        title="Banners"
        subtitle="Slides del hero de la portada."
      >
        <p>
          Ve a <Link href="/admin/banners" className="text-blue-600 underline">Banners</Link>.
          Cada banner tiene título, subtítulo, imagen de fondo, texto del botón y enlace. El carrusel
          rota automáticamente y soporta gestos táctiles y flechas del teclado.
        </p>
      </Section>

      <Section
        id="codigo"
        title="Código personalizado"
        subtitle="CDNs, CSS y JavaScript inyectados en todo el sitio."
      >
        <div className="space-y-2">
          <Step n={1}>
            <strong>CDNs externos</strong>: agrega hojas de estilo o scripts de otros dominios
            (Bootstrap, Google Fonts, Alertify, etc.).
          </Step>
          <Step n={2}>
            <strong>CSS personalizado</strong>: estilos propios que se inyectan en el{" "}
            <code className="font-mono">&lt;head&gt;</code>.
          </Step>
          <Step n={3}>
            <strong>JavaScript (arriba)</strong>: se ejecuta al inicio, antes de las librerías CDN.
          </Step>
          <Step n={4}>
            <strong>JavaScript (abajo)</strong>: se ejecuta al final, <strong>después</strong> de cargar
            los CDNs. Úsalo para lógica que dependa de librerías como Alertify.
          </Step>
        </div>
      </Section>

      <Section
        id="endpoint"
        title="Endpoint"
        subtitle="Importar o sincronizar productos desde una API externa."
      >
        <p>
          Solo superadmin. En <Link href="/admin/endpoint" className="text-blue-600 underline">Endpoint</Link>{" "}
          pega una URL que devuelva JSON con productos y usa:
        </p>
        <div className="space-y-2">
          <Step n={1}><strong>Probar</strong>: valida la conexión y muestra las claves detectadas.</Step>
          <Step n={2}><strong>Importar</strong>: reemplaza el catálogo con lo que traiga el endpoint.</Step>
          <Step n={3}><strong>Sincronizar</strong>: actualiza lo existente y agrega lo nuevo sin borrar.</Step>
        </div>
        <p className="text-gray-500">
          El sistema mapea campos comunes automáticamente (nombre, precio, stock, categoría, marca,
          imagen, etc.).
        </p>
      </Section>

      <Section
        id="api"
        title="API pública — crear tus propias vistas"
        subtitle="Consume tu catálogo en JSON desde HTML/JS y arma vitrinas personalizadas."
      >
        <p>
          El CMS expone el catálogo en JSON para que construyas vistas propias (tiendas, listados,
          vitrinas) sin tocar el panel. Responden en la misma URL del sitio.
        </p>

        <p className="font-semibold text-gray-900">Endpoints</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-500">Endpoint</th>
                <th className="px-3 py-2 font-semibold text-gray-500">Devuelve</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">GET /api/public/products</td>
                <td className="px-3 py-2">{`{ items, total, page, pages }`}</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">GET /api/public/brands</td>
                <td className="px-3 py-2">Array de marcas (strings)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">GET /api/public/categories</td>
                <td className="px-3 py-2">Array de categorías (strings)</td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-mono text-blue-600">GET /api/settings</td>
                <td className="px-3 py-2">Ajustes (incluye <code className="font-mono">currency</code>)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="font-semibold text-gray-900">Parámetros de /api/public/products</p>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold text-gray-500">Parámetro</th>
                <th className="px-3 py-2 font-semibold text-gray-500">Descripción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ["q", "Busca por nombre, categoría o marca"],
                ["category", "Filtra por categoría exacta"],
                ["brand", "Filtra por marca exacta (ej. ADATA)"],
                ["min / max", "Rango de precio"],
                ["page / limit", "Paginación (limit máx. 100)"],
                ["provider", "Id de proveedor (multi-sitio)"],
              ].map(([k, d]) => (
                <tr key={k}>
                  <td className="px-3 py-2 font-mono text-blue-600">{k}</td>
                  <td className="px-3 py-2">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          Cada producto trae: <code className="font-mono">id, name, slug, sku, description, price,
          image, category, brand, stock, is_active, is_hidden, sort_order</code>. El{" "}
          <code className="font-mono">price</code> llega como texto (ej.{" "}
          <code className="font-mono">{`"3300.00"`}</code>), conviértelo a número antes de formatearlo.
        </p>

        <p className="font-semibold text-gray-900">Cómo armar una vista propia</p>
        <div className="space-y-2">
          <Step n={1}>
            En <Link href="/admin/pages" className="text-blue-600 underline">Páginas</Link> crea una y
            pega el contenedor: <code className="font-mono">{`<div id="vitrina-tienda"></div>`}</code>.
          </Step>
          <Step n={2}>
            En <Link href="/admin/code" className="text-blue-600 underline">Código → JavaScript (abajo)</Link>{" "}
            pega el script que consume el API y renderiza los productos.
          </Step>
        </div>
        <p className="text-gray-500">
          El HTML de la página no ejecuta scripts por seguridad; por eso la lógica va en «Código»,
          que sí se ejecuta en todo el sitio.
        </p>

        <p className="font-semibold text-gray-900">Ejemplo: vitrina con filtro por marca</p>
        <Code>{`// Coloca en una Página:  <div id="vitrina-tienda"></div>
// Y este script en:  Código → JavaScript (abajo)

(async function () {
  var el = document.getElementById('vitrina-tienda');
  if (!el) return;

  // 1) Cargar marcas
  var brands = await fetch('/api/public/brands').then(function (r) { return r.json(); });
  var select = document.createElement('select');
  select.innerHTML = '<option value="">Todas las marcas</option>' +
    brands.map(function (b) {
      return '<option' + (b === 'ADATA' ? ' selected' : '') + '>' + b + '</option>';
    }).join('');
  select.style.cssText = 'margin-bottom:16px;padding:10px 12px;border:1px solid #e5e7eb;border-radius:10px;font-size:14px';
  el.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:16px';
  el.parentNode.insertBefore(select, el);

  var currency = 'S/.';
  try { currency = (await fetch('/api/settings').then(function (r) { return r.json(); })).currency || currency; } catch (e) {}

  async function cargar() {
    el.innerHTML = '<p style="color:#94a3b8">Cargando...</p>';
    var brand = select.value;
    var url = '/api/public/products?limit=24' + (brand ? '&brand=' + encodeURIComponent(brand) : '');
    var data = await fetch(url).then(function (r) { return r.json(); });
    el.innerHTML = (data.items || []).map(function (p) {
      var price = Number(p.price) || 0;
      return '<div style="background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden">' +
        '<img src="' + (p.image || '') + '" style="width:100%;height:150px;object-fit:contain;background:#f1f5f9">' +
        '<div style="padding:12px">' +
        '<div style="font-size:11px;color:#64748b;text-transform:uppercase">' + (p.brand || '&nbsp;') + '</div>' +
        '<div style="font-size:13px;font-weight:600;line-height:1.35">' + p.name + '</div>' +
        '<div style="font-size:11px;color:#94a3b8">SKU: ' + (p.sku || '—') + '</div>' +
        '<div style="font-size:16px;font-weight:800;color:#4f46e5;margin-top:6px">' +
          currency + price.toLocaleString('es-PE', { minimumFractionDigits: 2 }) + '</div>' +
        '</div></div>';
    }).join('');
  }

  select.addEventListener('change', cargar);
  cargar();
})();`}</Code>
      </Section>
    </div>
  );
}
