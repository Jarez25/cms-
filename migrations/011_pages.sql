-- 011_pages.sql — Páginas personalizadas
CREATE TABLE IF NOT EXISTS cms_pages (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider_id INT UNSIGNED NULL DEFAULT NULL,
  title VARCHAR(150) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  content LONGTEXT NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_pages_provider_slug (provider_id, slug),
  KEY idx_pages_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
