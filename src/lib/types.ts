export type ProjectType =
  | "web-app"
  | "mobile-app"
  | "api"
  | "cli"
  | "library"
  | "landing"
  | "other"

export interface ProjectStats {
  languages: Record<string, number>
  totalLines: number
  stars?: number
  forks?: number
  totalCommits?: number
  lastCommitDate?: string
}

export interface GitHubActivityData {
  commitsByDay: Record<string, number> // "YYYY-MM-DD" -> count (aggregated across all repos)
  lastUpdated: string
  repos: Record<string, RepoStats> // "owner/repo" -> stats
}

export interface RepoStats {
  stars: number
  forks: number
  languages: Record<string, number>
  lastCommitDate: string
  totalCommits: number
  description: string | null
}

export interface Project {
  slug: string
  name: string
  tagline: string
  description: string
  highlights: string[]
  type: ProjectType
  tags: string[]
  tech: string[]
  startDate: string // YYYY-MM-DD
  endDate: string | null
  stats: ProjectStats
  url: string | null
  repoUrl: string | null
  repoPrivate: boolean
  screenshots: string[]
  builtWithAI: boolean
  aiDetails: string | null
}
