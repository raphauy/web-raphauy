# CLAUDE.md

**Comunicarse siempre en español con el usuario.**

## Proyecto

raphauy.dev — Portfolio personal de Raphael, freelancer software engineer. Muestra 30+ proyectos con timeline cronológica, filtros por tecnología y páginas de detalle. El diseño completo está en `PRD.md` (fuente de verdad).

## Tech Stack

- **Framework**: Next.js 15 (App Router, SSG)
- **Estilos**: Tailwind CSS 4 + shadcn/ui (new-york style)
- **Animaciones**: Framer Motion
- **Datos**: JSON estáticos en `projects/<slug>/data.json`
- **Deploy**: Vercel (Static Site Generation)
- **Package Manager**: pnpm

## Architecture

### Datos
- Cada proyecto vive en `projects/<slug>/` con `data.json` + `screenshots/`.
- Schema del JSON definido en `PRD.md` sección 3.
- Las páginas se generan estáticamente con `generateStaticParams`.
- No hay base de datos, API ni backend — todo es estático en build time.

### Rutas
- `/` — Header compacto + Activity Grid + Timeline de proyectos
- `/projects/[slug]` — Página de detalle del proyecto

### Key Patterns
- SSG puro — todas las páginas pre-renderadas en build.
- Datos leídos del filesystem en build time (`fs.readFileSync` en server components).
- Filtros client-side con URL search params (`?tech=Next.js,Convex`).
- Dark mode por defecto, toggle con `localStorage` + `prefers-color-scheme`.
- Imágenes optimizadas con `next/image`.

## Commands

- `pnpm dev` — Next.js dev server
- `pnpm build` — Production build (SSG)
- `pnpm lint` — ESLint
- `pnpm typecheck` — TypeScript check

## Dominios

- `raphauy.dev` — principal
- `rapha.uy` — redirect 301 al principal
