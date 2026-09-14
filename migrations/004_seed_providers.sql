-- 004_seed_providers.sql — Proveedor de ejemplo (proveedor@demo.com / demo123)
INSERT INTO cms_providers (name, slug, email, password_hash, role, logo_image, is_active)
SELECT 'Proveedor Demo', 'proveedor-demo', 'proveedor@demo.com',
       'a1b2c3d4e5f6a7b8:aba09747f2db6994abf36a6ca87ef8963b742e940dbae2eb8e4990c08d011cd78e52eff2a4de98cc39eaa2fe25cf41595582f4e62b8f494ecc4d5222f8bf270d',
       'provider', '', 1
WHERE NOT EXISTS (SELECT 1 FROM cms_providers WHERE slug = 'proveedor-demo');

-- Contenido inicial del proveedor demo (solo si aún no tiene nada)
INSERT INTO cms_header (provider_id, site_name, logo_text, nav_items, social_links)
SELECT p.id, 'Proveedor Demo', 'Proveedor Demo',
  JSON_ARRAY(
    JSON_OBJECT('label', 'Inicio', 'href', '/'),
    JSON_OBJECT('label', 'Tienda', 'href', '/#tienda'),
    JSON_OBJECT('label', 'Contacto', 'href', '/#contacto')
  ),
  JSON_ARRAY(
    JSON_OBJECT('label', 'Facebook', 'url', 'https://facebook.com'),
    JSON_OBJECT('label', 'WhatsApp', 'url', 'https://wa.me/51999999999')
  )
FROM cms_providers p
WHERE p.slug = 'proveedor-demo'
  AND NOT EXISTS (SELECT 1 FROM cms_header h WHERE h.provider_id = p.id);

INSERT INTO cms_banners (provider_id, title, subtitle, image, button_text, button_link, is_active, sort_order)
SELECT p.id, 'Tienda de Proveedor Demo', 'Productos exclusivos de este proveedor', '', 'Ver tienda', '/#tienda', 1, 1
FROM cms_providers p
WHERE p.slug = 'proveedor-demo'
  AND NOT EXISTS (SELECT 1 FROM cms_banners b WHERE b.provider_id = p.id);

INSERT INTO cms_products (provider_id, name, slug, description, price, image, category, stock, is_active, sort_order)
SELECT p.id, 'Producto del Proveedor', 'producto-del-proveedor', 'Producto de ejemplo del proveedor demo.', 59.90, '', 'Exclusivo', 8, 1, 1
FROM cms_providers p
WHERE p.slug = 'proveedor-demo'
  AND NOT EXISTS (SELECT 1 FROM cms_products pr WHERE pr.provider_id = p.id);

INSERT INTO cms_footer (provider_id, about_text, address, phone, email, copyright, social_links)
SELECT p.id, 'Somos el proveedor demo de este CMS multi-sitio.', 'Av. Proveedores 456, Ciudad', '+51 988 888 888', 'contacto@proveedor.com', '© 2026 Proveedor Demo. Todos los derechos reservados.',
  JSON_ARRAY(
    JSON_OBJECT('label', 'Facebook', 'url', 'https://facebook.com'),
    JSON_OBJECT('label', 'WhatsApp', 'url', 'https://wa.me/51988888888')
  )
FROM cms_providers p
WHERE p.slug = 'proveedor-demo'
  AND NOT EXISTS (SELECT 1 FROM cms_footer f WHERE f.provider_id = p.id);
