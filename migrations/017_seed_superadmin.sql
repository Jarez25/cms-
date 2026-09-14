-- 017_seed_superadmin.sql
-- Crea/actualiza el superadministrador real en cms_providers.
-- Usuario: admin@admin.com
-- Password: demo123
--
-- El password_hash es exactamente el mismo hash que 004_seed_providers.sql
-- ya usa para la contraseña demo123, por lo que mantiene el formato esperado
-- por el proyecto.

INSERT INTO cms_providers (
    name,
    slug,
    email,
    password_hash,
    role,
    logo_image,
    is_active
) VALUES (
    'Administrador',
    'administrador',
    'admin@admin.com',
    'a1b2c3d4e5f6a7b8:aba09747f2db6994abf36a6ca87ef8963b742e940dbae2eb8e4990c08d011cd78e52eff2a4de98cc39eaa2fe25cf41595582f4e62b8f494ecc4d5222f8bf270d',
    'superadmin',
    '',
    1
)
ON DUPLICATE KEY UPDATE
    name = 'Administrador',
    slug = 'administrador',
    email = 'admin@admin.com',
    password_hash = 'a1b2c3d4e5f6a7b8:aba09747f2db6994abf36a6ca87ef8963b742e940dbae2eb8e4990c08d011cd78e52eff2a4de98cc39eaa2fe25cf41595582f4e62b8f494ecc4d5222f8bf270d',
    role = 'superadmin',
    is_active = 1;

-- Verificación
SELECT
    id,
    name,
    slug,
    email,
    role,
    is_active
FROM cms_providers
WHERE email = 'admin@admin.com';
