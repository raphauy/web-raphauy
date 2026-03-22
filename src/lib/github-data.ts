import { cacheLife, cacheTag } from "next/cache"
import { sql } from "./db"
import { GitHubActivityData, RepoStats } from "./types"

export async function getGitHubActivity(): Promise<GitHubActivityData | null> {
  "use cache"
  cacheLife("days")
  cacheTag("github-activity")

  try {
    // Query aggregated commits by day
    const commits = await sql`
      SELECT commit_date::text, SUM(commit_count)::int as count
      FROM commits_by_repo_day GROUP BY commit_date
    `

    // Query repo stats
    const repos = await sql`SELECT * FROM repo_stats`

    // Query metadata
    const meta = await sql`SELECT last_updated FROM github_activity_meta WHERE id = 1`

    if (commits.length === 0 && repos.length === 0) return null

    const commitsByDay: Record<string, number> = {}
    for (const row of commits) {
      commitsByDay[row.commit_date] = row.count
    }

    const reposMap: Record<string, RepoStats> = {}
    for (const row of repos) {
      reposMap[row.repo_key] = {
        stars: row.stars,
        forks: row.forks,
        languages: row.languages,
        lastCommitDate: row.last_commit_date,
        totalCommits: row.total_commits,
        description: row.description,
      }
    }

    return {
      commitsByDay,
      lastUpdated: meta[0]?.last_updated ?? "",
      repos: reposMap,
    }
  } catch {
    return null
  }
}
