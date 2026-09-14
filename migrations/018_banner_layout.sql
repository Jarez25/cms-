-- 018_banner_layout.sql - Posición de la foto de producto y del texto en banners
ALTER TABLE cms_banners
  ADD COLUMN image_position VARCHAR(20) NOT NULL DEFAULT 'right' AFTER image,
  ADD COLUMN text_position VARCHAR(20) NOT NULL DEFAULT 'left' AFTER image_position;
