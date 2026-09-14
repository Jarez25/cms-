-- 013_menus.sql - Menús estilo WordPress (múltiples menús, jerárquicos, activables)
CREATE TABLE IF NOT EXISTS cms_menus (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider_id INT UNSIGNED NULL DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  items JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_menus_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Personalización del header + menú asignado
ALTER TABLE cms_header
  ADD COLUMN menu_id INT UNSIGNED NULL DEFAULT NULL AFTER email,
  ADD COLUMN show_topbar TINYINT(1) NOT NULL DEFAULT 1 AFTER menu_id,
  ADD COLUMN show_store_button TINYINT(1) NOT NULL DEFAULT 1 AFTER show_topbar,
  ADD COLUMN sticky TINYINT(1) NOT NULL DEFAULT 1 AFTER show_store_button;

-- Seed: crea un "Menú principal" por header a partir de los enlaces existentes y lo asigna
INSERT INTO cms_menus (provider_id, name, is_active, items)
SELECT provider_id, 'Menú principal', 1, nav_items
FROM cms_header
WHERE JSON_LENGTH(nav_items) > 0;

UPDATE cms_header h
INNER JOIN cms_menus m
  ON ((m.provider_id IS NULL AND h.provider_id IS NULL) OR m.provider_id = h.provider_id)
  AND m.name = 'Menú principal'
SET h.menu_id = m.id
WHERE JSON_LENGTH(h.nav_items) > 0;
