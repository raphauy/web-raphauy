import { ProjectStats } from "@/lib/types"

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

export function StatsBar({ stats }: { stats: ProjectStats }) {
  const entries = Object.entries(stats.languages).sort(([, a], [, b]) => b - a)
  const total = entries.reduce((sum, [, v]) => sum + v, 0)

  return (
    <div className="space-y-3">
      {/* Language bars */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-secondary">
        {entries.map(([lang, lines]) => {
          const pct = (lines / total) * 100
          return (
            <div
              key={lang}
              className={`${langColors[lang] || "bg-zinc-500"}`}
              style={{ width: `${pct}%` }}
              title={`${lang}: ${lines.toLocaleString()} lines (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {entries.map(([lang, lines]) => {
          const pct = ((lines / total) * 100).toFixed(1)
          return (
            <div key={lang} className="flex items-center gap-1.5 text-xs">
              <div
                className={`h-2.5 w-2.5 rounded-full ${langColors[lang] || "bg-zinc-500"}`}
              />
              <span className="text-muted-foreground">{lang}</span>
              <span className="font-mono text-foreground">{pct}%</span>
            </div>
          )
        })}
      </div>

      {/* Total lines */}
      <p className="text-xs text-muted-foreground">
        <span className="font-mono font-medium text-foreground">
          {stats.totalLines.toLocaleString()}
        </span>{" "}
        total lines of code
      </p>
    </div>
  )
}
