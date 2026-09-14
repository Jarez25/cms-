-- 019_banner_hide.sql - Ocultar banners del sitio público
ALTER TABLE cms_banners
  ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;
