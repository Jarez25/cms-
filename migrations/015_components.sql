-- 015_components.sql - Biblioteca de componentes reutilizables (bloques) con id
CREATE TABLE IF NOT EXISTS cms_components (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  provider_id INT UNSIGNED NULL DEFAULT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'html',
  props JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  KEY idx_components_provider (provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Envíos de formularios de componentes
CREATE TABLE IF NOT EXISTS cms_component_submissions (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  component_id INT UNSIGNED NOT NULL,
  data JSON NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_submissions_component (component_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
