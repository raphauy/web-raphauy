import { neon } from "@neondatabase/serverless"
import { Octokit } from "@octokit/rest"
import * as dotenv from "dotenv"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL not found in .env")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

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

  // UPSERT commits into Neon
  console.log(`  Writing commits to Neon...`)
  for (const [date, count] of Object.entries(commitDays)) {
    await sql`
      INSERT INTO commits_by_repo_day (repo_key, commit_date, commit_count)
      VALUES (${repoKey}, ${date}::date, ${count})
      ON CONFLICT (repo_key, commit_date) DO UPDATE SET commit_count = EXCLUDED.commit_count
    `
  }

  // UPSERT repo stats
  await sql`
    INSERT INTO repo_stats (repo_key, stars, forks, languages, last_commit_date, total_commits, description)
    VALUES (
      ${repoKey},
      ${repoData.stargazers_count},
      ${repoData.forks_count},
      ${JSON.stringify(languages)}::jsonb,
      ${lastCommitDate || null}::date,
      ${totalCommits},
      ${repoData.description}
    )
    ON CONFLICT (repo_key) DO UPDATE SET
      stars = EXCLUDED.stars,
      forks = EXCLUDED.forks,
      languages = EXCLUDED.languages,
      last_commit_date = EXCLUDED.last_commit_date,
      total_commits = EXCLUDED.total_commits,
      description = EXCLUDED.description,
      updated_at = NOW()
  `

  // Update metadata
  await sql`
    INSERT INTO github_activity_meta (id, last_updated)
    VALUES (1, NOW())
    ON CONFLICT (id) DO UPDATE SET last_updated = NOW()
  `

  // Verify
  const repoCount = await sql`SELECT COUNT(*) as count FROM repo_stats`
  const commitCount = await sql`
    SELECT SUM(commit_count)::int as total FROM commits_by_repo_day
  `

  console.log(`\n✓ Saved to Neon database`)
  console.log(`  Total repos tracked: ${repoCount[0].count}`)
  console.log(`  Total commits across all repos: ${commitCount[0].total}`)
}

main().catch((err) => {
  console.error("Error:", err.message)
  process.exit(1)
})
