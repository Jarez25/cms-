-- 010_nav_routes.sql — Rutas nuevas: tienda, nosotros, contacto separados
UPDATE cms_header
SET nav_items = JSON_ARRAY(
  JSON_OBJECT('label', 'Inicio', 'href', '/'),
  JSON_OBJECT('label', 'Tienda', 'href', '/tienda'),
  JSON_OBJECT('label', 'Nosotros', 'href', '/nosotros'),
  JSON_OBJECT('label', 'Contacto', 'href', '/contacto')
)
WHERE provider_id IS NULL;

UPDATE cms_header
SET nav_items = JSON_ARRAY(
  JSON_OBJECT('label', 'Inicio', 'href', '/'),
  JSON_OBJECT('label', 'Tienda', 'href', '/tienda'),
  JSON_OBJECT('label', 'Nosotros', 'href', '/nosotros'),
  JSON_OBJECT('label', 'Contacto', 'href', '/contacto')
)
WHERE provider_id IS NOT NULL;

UPDATE cms_banners SET button_link = '/tienda' WHERE button_link = '/#tienda';
