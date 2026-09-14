# CMS

CMS multi-sitio con tienda integrada, construido con **Next.js (App Router) + React 19 + MySQL + Tailwind CSS 4**.

Permite administrar contenido, productos, banners, páginas y proveedores desde un panel propio, y publicar sitios independientes por proveedor.

## Características

- **Panel de administración** completo (Header, Banners, Tienda, Footer, Nosotros, Contacto, Páginas, Menús, Componentes, Código personalizado, Ajustes).
- **Tienda** con catálogo, categorías, marcas, SKU, stock, ocultar productos/categorías y filtros por categoría/marca/precio.
- **Banners** tipo hero con foto de producto posicionable (izquierda/centro/derecha) y enlace rápido a categorías de la tienda.
- **Componentes reutilizables** (HTML, CTA, Formulario, Productos) asignables a la portada, la tienda o páginas.
- **Páginas personalizadas** en HTML con su propia ruta.
- **Menús jerárquicos** estilo WordPress.
- **Código personalizado** por sitio: CDNs, CSS y JavaScript (head/body).
- **Multi-sitio (multi-tenant)**: superadmin global + proveedores con su propio contenido bajo `/p/[slug]`.
- **Sincronización/importación** de productos y banners desde un endpoint JSON externo.
- **Tema configurable** (paleta de colores) por sitio.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router)
- [React](https://react.dev) 19
- [MySQL](https://www.mysql.com) vía `mysql2`
- [Tailwind CSS](https://tailwindcss.com) 4
- TypeScript

## Requisitos

- Node.js 20+
- MySQL 8+ (o MariaDB)

## Instalación

```bash
# 1. Clonar e instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus credenciales de MySQL

# 3. Crear la base de datos y aplicar migraciones + seeds
npm run migrate

# 4. Levantar el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Variables de entorno (`.env`)

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=cms

ADMIN_PASSWORD=admin123
ADMIN_TOKEN_SECRET=cms-secreto-local-2026
```

> `.env` contiene secretos y **no se sube al repositorio**. Usa `.env.example` como plantilla.

## Acceso al panel

| Rol | Email | Contraseña |
|---|---|---|
| Superadmin | `admin@admin.com` | `demo123` |

Entra en `/login` → pestaña **Administrador**. La clave maestra `ADMIN_PASSWORD` (por defecto `admin123`) funciona como respaldo.

> Los proveedores se crean desde el panel (sección **Proveedores**, solo superadmin) o mediante `migrations/004_seed_providers.sql`.

## Scripts

| Comando | Descripción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm start` | Servidor de producción |
| `npm run lint` | ESLint |
| `npm run migrate` | Aplica las migraciones de `migrations/` |

## Estructura

```
src/
├── app/
│   ├── admin/        # Panel de administración
│   ├── api/          # API REST (rutas protegidas)
│   ├── login/        # Login (admin / proveedor)
│   ├── tienda/       # Tienda pública
│   ├── producto/     # Detalle de producto
│   ├── nosotros/     # Sección Nosotros
│   ├── contacto/     # Sección Contacto
│   ├── pagina/       # Páginas personalizadas
│   └── p/[slug]/     # Sitio de proveedor (multi-tenant)
├── components/
│   ├── admin/        # Componentes del panel
│   └── site/         # Componentes del sitio público
└── lib/              # Acceso a datos, auth, sync, tema, etc.
migrations/           # Migraciones SQL (aplicadas en orden)
scripts/migrate.mjs   # Runner de migraciones
public/uploads/       # Imágenes subidas (gitignored)
```

## Cómo funciona

- **Autenticación**: cookie firmada `cms_admin_token` (HMAC-SHA256). Dos roles: `superadmin` y `provider`.
- **Multi-tenant**: las tablas de contenido usan `provider_id` (NULL = sitio principal, id = proveedor). Cada proveedor gestiona su propio sitio.
- **Migraciones**: `npm run migrate` aplica en orden los archivos SQL de `migrations/` y registra las ya aplicadas en `schema_migrations`.
