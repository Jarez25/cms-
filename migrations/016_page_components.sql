-- 016_page_components.sql - Componentes asignados a cualquier página del CMS
ALTER TABLE cms_pages
  ADD COLUMN components JSON NULL AFTER content;
