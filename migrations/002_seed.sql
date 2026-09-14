-- 002_seed.sql — Datos iniciales de ejemplo
INSERT INTO cms_header (id, site_name, logo_text, nav_items, social_links)
VALUES (1, 'Mi Sitio', 'Mi Sitio',
  JSON_ARRAY(
    JSON_OBJECT('label', 'Inicio', 'href', '/'),
    JSON_OBJECT('label', 'Tienda', 'href', '/#tienda'),
    JSON_OBJECT('label', 'Nosotros', 'href', '/#nosotros'),
    JSON_OBJECT('label', 'Contacto', 'href', '/#contacto')
  ),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Facebook', 'url', 'https://facebook.com'),
    JSON_OBJECT('label', 'Instagram', 'url', 'https://instagram.com')
  )
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO cms_banners (title, subtitle, image, button_text, button_link, is_active, sort_order)
VALUES
  ('Bienvenido a Mi Tienda', 'Los mejores productos al mejor precio', '', 'Ver productos', '/#tienda', 1, 1),
  ('Ofertas de temporada', 'Hasta 50% de descuento en productos seleccionados', '', 'Comprar ahora', '/#tienda', 1, 2);

INSERT INTO cms_products (name, slug, description, price, image, category, stock, is_active, sort_order)
VALUES
  ('Producto Ejemplo 1', 'producto-ejemplo-1', 'Descripcion del producto de ejemplo numero 1.', 99.90, '', 'General', 10, 1, 1),
  ('Producto Ejemplo 2', 'producto-ejemplo-2', 'Descripcion del producto de ejemplo numero 2.', 149.90, '', 'General', 5, 1, 2);

INSERT INTO cms_footer (id, about_text, address, phone, email, copyright, social_links)
VALUES (1, 'Somos una tienda de ejemplo gestionada por un CMS propio.', 'Calle Falsa 123, Ciudad', '+51 999 999 999', 'contacto@misitio.com', '© 2026 Mi Sitio. Todos los derechos reservados.',
  JSON_ARRAY(
    JSON_OBJECT('label', 'Facebook', 'url', 'https://facebook.com'),
    JSON_OBJECT('label', 'Instagram', 'url', 'https://instagram.com')
  )
)
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO cms_settings (`key`, `value`) VALUES
  ('site_title', 'Mi Sitio - CMS'),
  ('site_description', 'Sitio gestionado con CMS propio en Next.js + MySQL'),
  ('whatsapp', '+51999999999'),
  ('currency', 'S/.')
ON DUPLICATE KEY UPDATE `value` = `value`;
