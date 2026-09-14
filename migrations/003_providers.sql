-- 003_providers.sql — Multi-sitio: proveedores con su propio contenido
CREATE TABLE IF NOT EXISTS cms_providers (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('superadmin','provider') NOT NULL DEFAULT 'provider',
  logo_image VARCHAR(500) NOT NULL DEFAULT '',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_providers_slug (slug),
  UNIQUE KEY uq_providers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE cms_header
  ADD COLUMN provider_id INT UNSIGNED NULL DEFAULT NULL AFTER id,
  ADD COLUMN favicon VARCHAR(500) NOT NULL DEFAULT '' AFTER logo_image,
  ADD KEY idx_header_provider (provider_id);

ALTER TABLE cms_banners
  ADD COLUMN provider_id INT UNSIGNED NULL DEFAULT NULL AFTER id,
  ADD KEY idx_banners_provider (provider_id);

ALTER TABLE cms_products
  ADD COLUMN provider_id INT UNSIGNED NULL DEFAULT NULL AFTER id,
  ADD KEY idx_products_provider (provider_id);

ALTER TABLE cms_footer
  ADD COLUMN provider_id INT UNSIGNED NULL DEFAULT NULL AFTER id,
  ADD KEY idx_footer_provider (provider_id);

ALTER TABLE cms_products DROP INDEX uq_products_slug;
ALTER TABLE cms_products ADD UNIQUE KEY uq_products_provider_slug (provider_id, slug);
