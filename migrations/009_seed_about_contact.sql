-- 009_seed_about_contact.sql — Contenido inicial de Nosotros y Contacto (sitio principal)
INSERT INTO cms_about (provider_id, title, subtitle, content, image)
SELECT NULL, 'Nosotros', 'Conoce más sobre nuestra empresa',
       'Somos una empresa dedicada a ofrecer los mejores productos de tecnología con el mejor servicio y los precios más competitivos del mercado.',
       ''
WHERE NOT EXISTS (SELECT 1 FROM cms_about WHERE provider_id IS NULL);

INSERT INTO cms_contact (provider_id, title, subtitle, address, phone, email, whatsapp, hours, lat, lng, map_url)
SELECT NULL, 'Contacto', 'Estamos para ayudarte',
       'San José, Costa Rica', '+506 2222 0000', 'contacto@eurocomp.cr', '+50688880000', 'Lun - Vie: 8:00 - 18:00',
       9.9281, -84.0907, ''
WHERE NOT EXISTS (SELECT 1 FROM cms_contact WHERE provider_id IS NULL);
