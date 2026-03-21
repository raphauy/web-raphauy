"use client"

import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Project } from "@/lib/types"
import { cn } from "@/lib/utils"

const CELL_SIZE = 12
const CELL_GAP = 3
const CELL_STEP = CELL_SIZE + CELL_GAP

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""]
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
]


function getDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

/** Generate all days for a year view (last 12 months from today, or a specific year) */
function generateYearDays(year: number | null): {
  days: Date[]
  startDate: Date
  endDate: Date
} {
  let startDate: Date
  let endDate: Date

  if (year === null) {
    // "Last year" mode — from ~1 year ago to today
    endDate = new Date()
    startDate = new Date(endDate)
    startDate.setFullYear(startDate.getFullYear() - 1)
    startDate.setDate(startDate.getDate() + 1)
  } else {
    startDate = new Date(year, 0, 1)
    endDate = new Date(year, 11, 31)
    // Don't go past today
    const today = new Date()
    if (endDate > today) endDate = today
  }

  // Adjust start to the previous Sunday (to align weeks)
  const startDay = startDate.getDay() // 0=Sun
  const adjustedStart = new Date(startDate)
  adjustedStart.setDate(adjustedStart.getDate() - startDay)

  const days: Date[] = []
  const current = new Date(adjustedStart)
  while (current <= endDate) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  // Fill last week to Saturday
  while (days.length % 7 !== 0) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return { days, startDate, endDate }
}

function buildProjectMap(projects: Project[]): Record<string, string[]> {
  const map: Record<string, string[]> = {}
  for (const p of projects) {
    const parts = p.startDate.split("-").map(Number)
    const day = parts[2] || 1
    const key = getDateKey(new Date(parts[0], parts[1] - 1, day))
    if (!map[key]) map[key] = []
    map[key].push(p.name)
  }
  return map
}

/** Calculate commit intensity level (0-4) using quartile thresholds */
function getCommitLevel(count: number, thresholds: number[]): number {
  if (count === 0) return 0
  if (count <= thresholds[0]) return 1
  if (count <= thresholds[1]) return 2
  if (count <= thresholds[2]) return 3
  return 4
}

/** Calculate quartile thresholds from commit data */
function calculateThresholds(commitsByDay: Record<string, number>): number[] {
  const counts = Object.values(commitsByDay).filter((c) => c > 0).sort((a, b) => a - b)
  if (counts.length === 0) return [1, 2, 3]
  const q1 = counts[Math.floor(counts.length * 0.25)] || 1
  const q2 = counts[Math.floor(counts.length * 0.5)] || 2
  const q3 = counts[Math.floor(counts.length * 0.75)] || 3
  return [q1, q2, q3]
}

interface Props {
  projects: Project[]
  commitsByDay: Record<string, number> | null
}

export function ProjectActivityGrid({ projects, commitsByDay }: Props) {
  const currentYear = new Date().getFullYear()

  // Available years based on project data + commit data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    for (const p of projects) {
      const y = parseInt(p.startDate.split("-")[0])
      years.add(y)
      if (p.endDate) {
        const ey = parseInt(p.endDate.split("-")[0])
        years.add(ey)
      }
    }
    if (commitsByDay) {
      for (const day of Object.keys(commitsByDay)) {
        years.add(parseInt(day.split("-")[0]))
      }
    }
    years.add(currentYear)
    return Array.from(years).sort((a, b) => b - a)
  }, [projects, commitsByDay, currentYear])

  // null = "last year" mode, number = specific year
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const projectMap = useMemo(() => buildProjectMap(projects), [projects])

  const thresholds = useMemo(
    () => (commitsByDay ? calculateThresholds(commitsByDay) : [1, 2, 3]),
    [commitsByDay],
  )

  const { days, startDate, endDate } = useMemo(
    () => generateYearDays(selectedYear),
    [selectedYear],
  )

  // Organize days into columns (weeks) of 7 rows each
  const weeks = useMemo(() => {
    const cols: Date[][] = []
    for (let i = 0; i < days.length; i += 7) {
      cols.push(days.slice(i, i + 7))
    }
    return cols
  }, [days])

  // Month labels positioned above the grid
  const monthLabels = useMemo(() => {
    const labels: { label: string; col: number }[] = []
    let lastMonth = -1
    weeks.forEach((week, colIndex) => {
      // Use the first day that's actually in range
      const representative = week.find((d) => d >= startDate) ?? week[0]
      const m = representative.getMonth()
      if (m !== lastMonth) {
        labels.push({ label: MONTH_NAMES[m], col: colIndex })
        lastMonth = m
      }
    })
    return labels
  }, [weeks, startDate])

  // Count projects and commits in selected range
  const { totalProjects, totalCommits, totalLoc } = useMemo(() => {
    const commits = commitsByDay
      ? Object.values(commitsByDay).reduce((a, b) => a + b, 0)
      : 0
    const loc = projects.reduce((sum, p) => sum + p.stats.totalLines, 0)
    return { totalProjects: projects.length, totalCommits: commits, totalLoc: loc }
  }, [projects, commitsByDay])

  const gridWidth = weeks.length * CELL_STEP - CELL_GAP

  return (
    <div className="flex gap-4">
      {/* Main grid area */}
      <div className="flex-1 min-w-0">
        {/* Title */}
        <p className="mb-3 text-sm text-muted-foreground">
          {totalProjects} project{totalProjects !== 1 ? "s" : ""}
          {totalCommits > 0 && (
            <>, {totalCommits.toLocaleString()} commit{totalCommits !== 1 ? "s" : ""}</>
          )}
          {totalLoc > 0 && (
            <>, {totalLoc.toLocaleString()} loc</>
          )}
          {" "}in the last 3 years
        </p>

        <div className="overflow-x-auto">
          <div className="inline-flex">
            {/* Day labels column */}
            <div
              className="flex flex-col mr-2 shrink-0"
              style={{ paddingTop: CELL_STEP + 1 }}
            >
              {DAY_LABELS.map((label, i) => (
                <div
                  key={i}
                  className="text-[10px] text-muted-foreground leading-none"
                  style={{ height: CELL_STEP }}
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Grid with month labels */}
            <div>
              {/* Month labels */}
              <div className="relative" style={{ height: CELL_STEP, width: gridWidth }}>
                {monthLabels.map(({ label, col }) => (
                  <span
                    key={`${label}-${col}`}
                    className="absolute text-[10px] text-muted-foreground"
                    style={{ left: col * CELL_STEP }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Cells grid */}
              <div className="flex gap-[3px]">
                {weeks.map((week, colIndex) => (
                  <div key={colIndex} className="flex flex-col gap-[3px]">
                    {week.map((day, rowIndex) => {
                      const key = getDateKey(day)
                      const projectNames = projectMap[key] || []
                      const hasProject = projectNames.length > 0
                      const commitCount = commitsByDay?.[key] ?? 0
                      const isOutOfRange = day < startDate || day > endDate

                      if (isOutOfRange) {
                        return (
                          <div
                            key={rowIndex}
                            className="rounded-[2px]"
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          />
                        )
                      }

                      const commitLevel = getCommitLevel(commitCount, thresholds)
                      const hasTooltip = hasProject || commitCount > 0

                      if (!hasTooltip) {
                        return (
                          <motion.div
                            key={rowIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: colIndex * 0.008,
                            }}
                            className="rounded-[2px] bg-[#ebedf0] dark:bg-[#161b22]"
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                          />
                        )
                      }

                      return (
                        <Tooltip key={rowIndex}>
                          <TooltipTrigger asChild>
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{
                                duration: 0.3,
                                delay: colIndex * 0.008,
                              }}
                              className={cn(
                                "rounded-[2px]",
                                hasProject
                                  ? "bg-[#da3633] dark:bg-[#f85149]"
                                  : commitLevel === 1
                                    ? "bg-[#9be9a8] dark:bg-[#0e4429]"
                                    : commitLevel === 2
                                      ? "bg-[#40c463] dark:bg-[#006d32]"
                                      : commitLevel === 3
                                        ? "bg-[#30a14e] dark:bg-[#26a641]"
                                        : "bg-[#216e39] dark:bg-[#39d353]",
                              )}
                              style={{ width: CELL_SIZE, height: CELL_SIZE }}
                            />

                          </TooltipTrigger>
                          <TooltipContent>
                            {hasProject ? (
                              <p className="text-sm">
                                {projectNames.join(", ")} started on{" "}
                                {formatDate(key)}
                              </p>
                            ) : commitCount > 0 ? (
                              <p className="text-sm">
                                {commitCount} commit{commitCount !== 1 ? "s" : ""} on{" "}
                                {formatDate(key)}
                              </p>
                            ) : (
                              <p className="text-xs text-muted-foreground">
                                {formatDate(key)}
                              </p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              {commitsByDay && (
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-muted-foreground">Less</span>
                    {[
                      "bg-[#ebedf0] dark:bg-[#161b22]",
                      "bg-[#9be9a8] dark:bg-[#0e4429]",
                      "bg-[#40c463] dark:bg-[#006d32]",
                      "bg-[#30a14e] dark:bg-[#26a641]",
                      "bg-[#216e39] dark:bg-[#39d353]",
                    ].map((cls, i) => (
                      <div
                        key={i}
                        className={cn("rounded-[2px]", cls)}
                        style={{ width: 10, height: 10 }}
                      />
                    ))}
                    <span className="text-[10px] text-muted-foreground">More</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div
                      className="rounded-[2px] bg-[#da3633] dark:bg-[#f85149]"
                      style={{ width: 10, height: 10 }}
                    />
                    <span className="text-[10px] text-muted-foreground">Project start</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Year selector */}
      <div className="flex flex-col gap-1 shrink-0">
        <button
          onClick={() => setSelectedYear(null)}
          className={cn(
            "cursor-pointer rounded-md px-4 py-1.5 text-sm text-right transition-colors",
            selectedYear === null
              ? "bg-primary text-primary-foreground font-medium"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {currentYear}
        </button>
        {availableYears
          .filter((y) => y < currentYear)
          .map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={cn(
                "cursor-pointer rounded-md px-4 py-1.5 text-sm text-right transition-colors",
                selectedYear === year
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {year}
            </button>
          ))}
      </div>
    </div>
  )
}
