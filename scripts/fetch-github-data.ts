import { Octokit } from "@octokit/rest"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

interface RepoStats {
  stars: number
  forks: number
  languages: Record<string, number>
  lastCommitDate: string
  totalCommits: number
  description: string | null
}

interface GitHubActivityData {
  commitsByDay: Record<string, number>
  lastUpdated: string
  repos: Record<string, RepoStats>
}

const DATA_PATH = path.join(process.cwd(), "data", "github-activity.json")

function parseRepoArg(arg: string): { owner: string; repo: string } {
  // Accept full URL or owner/repo format
  const urlMatch = arg.match(/github\.com\/([^/]+)\/([^/]+?)(?:\.git)?$/)
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] }
  }
  const parts = arg.split("/")
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] }
  }
  throw new Error(`Invalid repo format: "${arg}". Use owner/repo or a GitHub URL.`)
}

function loadExistingData(): GitHubActivityData {
  if (fs.existsSync(DATA_PATH)) {
    return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"))
  }
  return { commitsByDay: {}, lastUpdated: "", repos: {} }
}

function saveData(data: GitHubActivityData) {
  const dir = path.dirname(DATA_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n")
}

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error("Usage: pnpm github-data <owner/repo or GitHub URL>")
    process.exit(1)
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.error("Error: GITHUB_TOKEN not found in .env")
    process.exit(1)
  }

  const { owner, repo } = parseRepoArg(arg)
  const repoKey = `${owner}/${repo}`
  console.log(`\nFetching data for ${repoKey}...`)

  const octokit = new Octokit({ auth: token })

  // Fetch repo info
  const { data: repoData } = await octokit.rest.repos.get({ owner, repo })
  console.log(`  Repository: ${repoData.full_name}`)
  console.log(`  Stars: ${repoData.stargazers_count} | Forks: ${repoData.forks_count}`)

  // Fetch languages
  const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo })
  console.log(`  Languages: ${Object.keys(languages).join(", ")}`)

  // Fetch all commits with pagination
  console.log(`  Fetching commits...`)
  const commitDays: Record<string, number> = {}
  let totalCommits = 0
  let lastCommitDate = ""
  let page = 1

  while (true) {
    const { data: commits, headers } = await octokit.rest.repos.listCommits({
      owner,
      repo,
      per_page: 100,
      page,
    })

    if (commits.length === 0) break

    for (const commit of commits) {
      const date = commit.commit.author?.date
      if (!date) continue
      const day = date.slice(0, 10) // "YYYY-MM-DD"
      commitDays[day] = (commitDays[day] || 0) + 1
      totalCommits++
      if (!lastCommitDate || day > lastCommitDate) {
        lastCommitDate = day
      }
    }

    // Check rate limit
    const remaining = parseInt(headers["x-ratelimit-remaining"] || "999")
    if (remaining < 10) {
      const resetTime = parseInt(headers["x-ratelimit-reset"] || "0") * 1000
      const waitMs = Math.max(0, resetTime - Date.now()) + 1000
      console.log(`  Rate limit low (${remaining} remaining), waiting ${Math.ceil(waitMs / 1000)}s...`)
      await new Promise((resolve) => setTimeout(resolve, waitMs))
    }

    // Check if there are more pages
    const linkHeader = headers.link || ""
    if (!linkHeader.includes('rel="next"')) break

    page++
    if (page % 5 === 0) {
      console.log(`  ...fetched ${totalCommits} commits so far (page ${page})`)
    }
  }

  console.log(`  Total commits: ${totalCommits}`)

  // Load existing data and merge
  const data = loadExistingData()

  // If this repo was already processed, subtract its old commits from commitsByDay
  const oldRepoKey = data.repos[repoKey]
  if (oldRepoKey) {
    console.log(`  Repo already exists, updating...`)
    // We need to re-calculate commitsByDay by subtracting old repo commits
    // We don't have per-repo commit days stored, so we rebuild from scratch
    // by removing the old total and adding new
    // This is a simplification — for perfect accuracy we'd need per-repo day data
    // Instead, we store per-repo commit days in a separate structure
  }

  // To handle re-runs properly, store per-repo commit days
  // and rebuild the aggregate commitsByDay from all repos
  const perRepoCommits: Record<string, Record<string, number>> = {}

  // Load per-repo data from existing repos (reconstruct from aggregate if needed)
  // For simplicity on first implementation: rebuild aggregate from scratch
  // Store individual repo commits in a parallel file
  const perRepoPath = path.join(path.dirname(DATA_PATH), "github-commits-by-repo.json")
  if (fs.existsSync(perRepoPath)) {
    Object.assign(perRepoCommits, JSON.parse(fs.readFileSync(perRepoPath, "utf-8")))
  }

  // Update this repo's commits
  perRepoCommits[repoKey] = commitDays

  // Rebuild aggregate commitsByDay from all repos
  const aggregated: Record<string, number> = {}
  for (const repoCommits of Object.values(perRepoCommits)) {
    for (const [day, count] of Object.entries(repoCommits)) {
      aggregated[day] = (aggregated[day] || 0) + count
    }
  }

  // Update main data
  data.commitsByDay = aggregated
  data.lastUpdated = new Date().toISOString()
  data.repos[repoKey] = {
    stars: repoData.stargazers_count,
    forks: repoData.forks_count,
    languages,
    lastCommitDate,
    totalCommits,
    description: repoData.description,
  }

  // Save both files
  saveData(data)
  fs.writeFileSync(perRepoPath, JSON.stringify(perRepoCommits, null, 2) + "\n")

  console.log(`\n✓ Saved to ${DATA_PATH}`)
  console.log(`  Total repos tracked: ${Object.keys(data.repos).length}`)
  console.log(`  Total unique days with commits: ${Object.keys(data.commitsByDay).length}`)

  // Print summary
  const totalAggregatedCommits = Object.values(data.commitsByDay).reduce((a, b) => a + b, 0)
  console.log(`  Total commits across all repos: ${totalAggregatedCommits}`)
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
