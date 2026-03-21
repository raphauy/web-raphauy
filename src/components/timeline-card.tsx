"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { Project } from "@/lib/types"
import { extractAITool } from "@/lib/utils"
import { Button } from "./ui/button"
import { TechBadge } from "./tech-badge"
import { AIBadge } from "./ai-badge"

const typeLabels: Record<string, string> = {
  "web-app": "Web App",
  "mobile-app": "Mobile App",
  api: "API",
  cli: "CLI",
  library: "Library",
  landing: "Landing",
  other: "Other",
}

const langColors: Record<string, string> = {
  TypeScript: "bg-blue-500",
  JavaScript: "bg-yellow-400",
  CSS: "bg-purple-500",
  HTML: "bg-orange-500",
  Python: "bg-green-500",
  SQL: "bg-indigo-500",
  JSON: "bg-zinc-400",
  YAML: "bg-red-400",
  Rust: "bg-orange-600",
  Go: "bg-cyan-500",
}

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
}

function formatLines(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return n.toString()
}

export function TimelineCard({
  project,
  index,
}: {
  project: Project
  index: number
}) {
  const isLeft = index % 2 === 0
  const langEntries = Object.entries(project.stats.languages).sort(
    ([, a], [, b]) => b - a
  )
  const langTotal = langEntries.reduce((s, [, v]) => s + v, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className={`relative flex w-full items-center ${
        isLeft ? "md:justify-start" : "md:justify-end"
      }`}
    >
      {/* Timeline dot (desktop) */}
      <div className="absolute left-0 top-6 z-10 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-background md:left-1/2 md:block" />

      {/* Timeline dot (mobile) */}
      <div className="absolute left-0 top-6 z-10 h-3 w-3 -translate-x-1/2 rounded-full border-2 border-accent bg-background md:hidden" />

      <Link
        href={`/projects/${project.slug}`}
        className={`group ml-6 w-full md:ml-0 ${
          isLeft
            ? "md:mr-[calc(50%+2rem)] md:pr-0"
            : "md:ml-[calc(50%+2rem)] md:pl-0"
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="rounded-lg border border-border bg-card p-5 shadow-sm transition-shadow group-hover:shadow-lg"
        >
          {/* Row 1: type label + date */}
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium tracking-wide text-muted-foreground">
              {project.tech[0] ? `${project.tech[0]} App` : typeLabels[project.type] || project.type}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDate(project.startDate)}
            </span>
          </div>

          {/* Row 2: name + tagline */}
          <h3 className="text-lg font-semibold tracking-tight">
            {project.name}
          </h3>
          <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
            {project.tagline}
          </p>

          {/* Row 3: language bar + total lines */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              {langEntries.map(([lang, lines]) => (
                <div
                  key={lang}
                  className={langColors[lang] || "bg-zinc-500"}
                  style={{ width: `${(lines / langTotal) * 100}%` }}
                />
              ))}
            </div>
            <span className="shrink-0 font-mono text-xs text-muted-foreground">
              {formatLines(project.stats.totalLines)} loc
            </span>
          </div>

          {/* Row 4: language legend (top 3) */}
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5">
            {langEntries.slice(0, 3).map(([lang, lines]) => (
              <span
                key={lang}
                className="flex items-center gap-1 text-[11px] text-muted-foreground"
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${langColors[lang] || "bg-zinc-500"}`}
                />
                {lang}{" "}
                <span className="font-mono">
                  {((lines / langTotal) * 100).toFixed(0)}%
                </span>
              </span>
            ))}
          </div>

          {/* Row 5: tech badges */}
          <div className="mt-4 flex flex-wrap items-center gap-1.5">
            {project.tech.map((tech) => (
              <TechBadge key={tech} name={tech} />
            ))}
          </div>

          {/* Row 6: AI badge + project URL */}
          {(project.builtWithAI || project.url) && (
            <div className="mt-3 flex items-center justify-between">
              <div>
                {project.builtWithAI && (
                  <AIBadge
                    tool={extractAITool(project.aiDetails)}
                    details={project.aiDetails}
                  />
                )}
              </div>
              {project.url && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto gap-1 p-0 text-xs text-foreground"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    window.open(project.url!, "_blank", "noopener,noreferrer")
                  }}
                >
                  {new URL(project.url).hostname.replace("www.", "")}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              )}
            </div>
          )}
        </motion.div>
      </Link>
    </motion.div>
  )
}
