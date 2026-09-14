-- 007_product_brand.sql — Columna marca para filtrar por marca
ALTER TABLE cms_products
  ADD COLUMN brand VARCHAR(255) NOT NULL DEFAULT '' AFTER category,
  ADD KEY idx_products_brand (brand);
