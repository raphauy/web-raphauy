"use client"

import { useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Project } from "@/lib/types"
import { ProjectActivityGrid } from "./project-activity-grid"
import { FilterBar } from "./filter-bar"
import { Timeline } from "./timeline"

interface HomeContentProps {
  projects: Project[]
  allTechs: string[]
  commitsByDay: Record<string, number> | null
}

export function HomeContent({ projects, allTechs, commitsByDay }: HomeContentProps) {
  const searchParams = useSearchParams()

  const filteredProjects = useMemo(() => {
    const techParam = searchParams.get("tech")
    if (!techParam) return projects

    const selectedTechs = techParam.split(",").filter(Boolean)
    if (selectedTechs.length === 0) return projects

    return projects.filter((p) =>
      selectedTechs.some((t) => p.tech.includes(t))
    )
  }, [projects, searchParams])

  return (
    <main className="flex-1">
      {/* Activity Grid */}
      <section className="mx-auto max-w-5xl px-6 py-8">
        <ProjectActivityGrid projects={projects} commitsByDay={commitsByDay} />
      </section>

      <hr className="border-border" />

      {/* Timeline section */}
      <section className="mx-auto max-w-5xl px-6 py-10">
        {/* Filter Bar */}
        <FilterBar allTechs={allTechs} />

        <Timeline projects={filteredProjects} />
      </section>
    </main>
  )
}
