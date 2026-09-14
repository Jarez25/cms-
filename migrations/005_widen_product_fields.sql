-- 005_widen_product_fields.sql — Ampliar columnas para el catálogo real
ALTER TABLE cms_products
  MODIFY name VARCHAR(500) NOT NULL,
  MODIFY slug VARCHAR(300) NOT NULL,
  MODIFY category VARCHAR(255) NOT NULL DEFAULT '',
  MODIFY image VARCHAR(1000) NOT NULL DEFAULT '';
