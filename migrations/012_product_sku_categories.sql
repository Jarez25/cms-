-- 012_product_sku_categories.sql — SKU en productos + taxonomía de categorías
ALTER TABLE cms_products
  ADD COLUMN sku VARCHAR(150) NOT NULL DEFAULT '' AFTER slug;

CREATE TABLE IF NOT EXISTS cms_categories (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider_id INT UNSIGNED NULL DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_categories_provider_slug (provider_id, slug),
  KEY idx_categories_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
