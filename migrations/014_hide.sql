-- 014_hide.sql - Ocultar productos y categorías aunque los envíe el endpoint
ALTER TABLE cms_products
  ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;

ALTER TABLE cms_categories
  ADD COLUMN is_hidden TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;
