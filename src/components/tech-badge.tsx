import { Badge } from "@/components/ui/badge"

const categoryColors: Record<string, string> = {
  "Next.js": "bg-black text-white border-black/20 dark:bg-white dark:text-black dark:border-white/20",
  React: "bg-sky-500/10 text-sky-600 border-sky-500/20 dark:text-sky-400 dark:border-sky-400/20",
  TypeScript: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-400/20",
  "Tailwind CSS": "bg-cyan-500/10 text-cyan-600 border-cyan-500/20 dark:text-cyan-400 dark:border-cyan-400/20",
  "Framer Motion": "bg-purple-500/10 text-purple-600 border-purple-500/20 dark:text-purple-400 dark:border-purple-400/20",
  OpenAI: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400 dark:border-emerald-400/20",
  Convex: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:border-red-400/20",
  PostgreSQL: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-400 dark:border-indigo-400/20",
  Redis: "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400 dark:border-red-400/20",
  Docker: "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:text-blue-400 dark:border-blue-400/20",
  "Node.js": "bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400 dark:border-green-400/20",
}

const defaultColor = "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-400 dark:border-zinc-400/20"

export function TechBadge({ name }: { name: string }) {
  const color = categoryColors[name] || defaultColor

  return (
    <Badge variant="secondary" className={`${color} border text-xs font-medium`}>
      {name}
    </Badge>
  )
}
