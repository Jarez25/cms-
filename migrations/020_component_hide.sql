-- 020_component_hide.sql - Ocultar componentes (banners personalizados) del sitio
ALTER TABLE cms_components
  ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;
