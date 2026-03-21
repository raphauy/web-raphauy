# raphauy.dev

Personal portfolio of Raphael Carvalho — freelance software engineer.

Built with Next.js 15, Tailwind CSS 4, shadcn/ui, and Framer Motion. Fully static (SSG), deployed on Vercel.

## Features

- Chronological timeline of 30+ projects with tech badges and language stats
- GitHub-style activity grid with real commit data and project start markers
- Tech filter bar to browse projects by technology
- Project detail pages with screenshot galleries
- Dark mode by default with toggle

## Setup

```bash
pnpm install
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build (SSG) |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | TypeScript check |
| `pnpm github-data <repo>` | Fetch GitHub commit data for a repo |

## Adding projects

```bash
# Auto-detect next project from docs/github-repos.md
/discover

# Or specify manually
/discover ~/desarrollo/my-repo --slug my-project
```
