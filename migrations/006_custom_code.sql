-- 006_custom_code.sql — Código personalizado (CDNs, CSS y JS) por sitio
CREATE TABLE IF NOT EXISTS cms_custom_code (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider_id INT UNSIGNED NULL DEFAULT NULL,
  cdn_items JSON NOT NULL,
  css TEXT NOT NULL,
  js_head TEXT NOT NULL,
  js_body TEXT NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_custom_code_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
