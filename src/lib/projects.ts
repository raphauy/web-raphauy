import fs from "fs"
import path from "path"
import { Project } from "./types"

const projectsDir = path.join(process.cwd(), "projects")

export function getAllProjects(): Project[] {
  const slugs = getProjectSlugs()
  const projects = slugs
    .map((slug) => getProjectBySlug(slug))
    .filter((p): p is Project => p !== null)

  // Sort by startDate descending (most recent first)
  projects.sort((a, b) => b.startDate.localeCompare(a.startDate))
  return projects
}

export function getProjectBySlug(slug: string): Project | null {
  const dataPath = path.join(projectsDir, slug, "data.json")
  if (!fs.existsSync(dataPath)) return null

  const raw = fs.readFileSync(dataPath, "utf-8")
  return JSON.parse(raw) as Project
}

export function getProjectSlugs(): string[] {
  if (!fs.existsSync(projectsDir)) return []
  return fs
    .readdirSync(projectsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .filter((d) =>
      fs.existsSync(path.join(projectsDir, d.name, "data.json"))
    )
    .map((d) => d.name)
}

export function getAllTechs(): string[] {
  const projects = getAllProjects()
  const techSet = new Set<string>()
  for (const project of projects) {
    for (const tech of project.tech) {
      techSet.add(tech)
    }
  }
  return Array.from(techSet).sort()
}

export function getScreenshotPath(slug: string, filename: string): string {
  return `/projects/${slug}/screenshots/${filename}`
}
