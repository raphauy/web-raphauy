"use client"

import { Project } from "@/lib/types"
import { TimelineCard } from "./timeline-card"

export function Timeline({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No projects match the selected filters.
      </div>
    )
  }

  return (
    <div className="relative">
      {/* Vertical line - mobile (left) */}
      <div className="absolute left-0 top-0 h-full w-px bg-border md:hidden" />

      {/* Vertical line - desktop (center) */}
      <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-border md:block" />

      <div className="flex flex-col gap-10">
        {projects.map((project, i) => (
          <TimelineCard key={project.slug} project={project} index={i} />
        ))}
      </div>
    </div>
  )
}
