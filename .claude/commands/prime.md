---
description: Prime agent with codebase understanding
---

# Prime: Load Project Context

## Objective

Build comprehensive understanding of the codebase by analyzing structure, documentation, and key files.

## Process

### 1. Analyze Project Structure

List all tracked files:
!`git ls-files`

Show directory structure (sin screenshots ni node_modules):
!`find . -maxdepth 3 -not -path '*/node_modules/*' -not -path '*/.git/*' -not -path '*/.next/*' -not -path '*/projects/*/screenshots/*' | sort`

### 2. Read Core Documentation

- Read `PRD.md` (fuente de verdad del producto: schema de datos, páginas, diseño)
- Read `CLAUDE.md` (reglas y convenciones del proyecto) and `AGENTS.md`
- Read `README.md` at project root
- Read `docs/github-repos.md` (notas sobre repos de GitHub)

### 3. Identify Key Files

Based on the structure, identify and read:
- Main entry points (`src/app/layout.tsx`, `src/app/page.tsx`)
- Routing (`src/app/projects/[slug]/page.tsx`, `src/app/sitemap.ts`, `src/app/robots.ts`)
- Core configuration (`package.json`, `tsconfig.json`, `next.config.ts`, `components.json`, `vercel.json`)
- Data layer (`src/lib/projects.ts`, `src/lib/types.ts` — schema del `data.json`)
- GitHub activity layer (`src/lib/github-data.ts`, `src/lib/db.ts`, `src/app/api/cron/update-commits/route.ts`)
- Core components (`src/components/timeline.tsx`, `src/components/project-detail.tsx`, `src/components/filter-bar.tsx`, `src/components/project-activity-grid.tsx`)
- Scripts (`scripts/fetch-github-data.ts`, `scripts/redact.ts`, `scripts/migrate-to-neon.ts`)
- Slash commands (`.claude/commands/discover.md`, `.claude/commands/redact.md`)
- Un `data.json` de ejemplo (p. ej. `projects/sinergia-life-tenis/data.json`)

### 4. Understand Current State

Check recent activity:
!`git log -10 --oneline`

Check current branch and status:
!`git status`

## Output Report

Provide a concise summary covering:

### Project Overview
- Purpose and type of application (portfolio personal SSG con 30+ proyectos)
- Primary technologies and frameworks
- Current state

### Architecture
- SSG puro — todas las páginas pre-renderadas con `generateStaticParams`
- Datos por proyecto en `projects/<slug>/data.json` + `screenshots/`, leídos del filesystem en build time
- Neon (Postgres serverless) usado SOLO para cachear la actividad de GitHub (commits por día), refrescado por cron
- Filtros client-side con URL search params (`?tech=...`)
- Important directories and their purposes

### Tech Stack
- Next.js 16 (App Router, SSG) + React 19
- Tailwind CSS 4 + shadcn/ui (new-york) + Framer Motion
- Datos: JSON estáticos en `projects/<slug>/data.json`
- Neon serverless (`@neondatabase/serverless`) + cron para GitHub activity
- `@octokit/rest` para datos de GitHub, `sharp` para imágenes, `tsx` para scripts
- Deploy: Vercel · pnpm

### Data Schema
- Estructura de `data.json` (`src/lib/types.ts` — `Project`, `ProjectStats`, `GitHubActivityData`)
- Cómo se cargan los proyectos (`src/lib/projects.ts`)
- Tablas Neon de actividad GitHub (`commits_by_repo_day`, `repo_stats`, `github_activity_meta`)

### Core Principles
- Code style and conventions
- Component patterns (RSC vs client)
- Dark mode por defecto, manejo de imágenes con `next/image`
- Workflow de alta de proyectos (`/discover` para generar `data.json`, `/redact` para difuminar info sensible en screenshots)

### Current State
- Active branch
- Recent changes or development focus
- Any immediate observations

**Make this summary easy to scan - use bullet points and clear headers.**
