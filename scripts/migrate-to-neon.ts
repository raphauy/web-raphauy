import { neon } from "@neondatabase/serverless"
import * as dotenv from "dotenv"
import fs from "fs"
import path from "path"

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error("Error: DATABASE_URL not found in .env")
  process.exit(1)
}

const sql = neon(DATABASE_URL)

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

async function main() {
  const activityPath = path.join(process.cwd(), "data", "github-activity.json")
  const perRepoPath = path.join(process.cwd(), "data", "github-commits-by-repo.json")

  if (!fs.existsSync(activityPath)) {
    console.error("Error: data/github-activity.json not found")
    process.exit(1)
  }

  const activity: GitHubActivityData = JSON.parse(fs.readFileSync(activityPath, "utf-8"))
  const perRepoCommits: Record<string, Record<string, number>> = fs.existsSync(perRepoPath)
    ? JSON.parse(fs.readFileSync(perRepoPath, "utf-8"))
    : {}

  // Create tables
  console.log("Creating tables...")
  await sql`
    CREATE TABLE IF NOT EXISTS commits_by_repo_day (
      repo_key TEXT NOT NULL,
      commit_date DATE NOT NULL,
      commit_count INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (repo_key, commit_date)
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS repo_stats (
      repo_key TEXT PRIMARY KEY,
      stars INTEGER NOT NULL DEFAULT 0,
      forks INTEGER NOT NULL DEFAULT 0,
      languages JSONB NOT NULL DEFAULT '{}',
      last_commit_date DATE,
      total_commits INTEGER NOT NULL DEFAULT 0,
      description TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `
  await sql`
    CREATE TABLE IF NOT EXISTS github_activity_meta (
      id INTEGER PRIMARY KEY DEFAULT 1,
      last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (id = 1)
    )
  `
  console.log("Tables created.")

  // Insert per-repo commits
  let totalRows = 0
  for (const [repoKey, days] of Object.entries(perRepoCommits)) {
    const entries = Object.entries(days)
    if (entries.length === 0) continue

    // Insert one by one using tagged template literals
    for (const [date, count] of entries) {
      await sql`
        INSERT INTO commits_by_repo_day (repo_key, commit_date, commit_count)
        VALUES (${repoKey}, ${date}::date, ${count})
        ON CONFLICT (repo_key, commit_date) DO UPDATE SET commit_count = EXCLUDED.commit_count
      `
      totalRows++
    }
    console.log(`  Inserted ${Object.keys(days).length} days for ${repoKey}`)
  }
  console.log(`Total commit rows inserted: ${totalRows}`)

  // Insert repo stats
  for (const [repoKey, stats] of Object.entries(activity.repos)) {
    await sql`
      INSERT INTO repo_stats (repo_key, stars, forks, languages, last_commit_date, total_commits, description)
      VALUES (
        ${repoKey},
        ${stats.stars},
        ${stats.forks},
        ${JSON.stringify(stats.languages)}::jsonb,
        ${stats.lastCommitDate || null}::date,
        ${stats.totalCommits},
        ${stats.description}
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
  }
  console.log(`Repo stats inserted: ${Object.keys(activity.repos).length} repos`)

  // Insert metadata
  await sql`
    INSERT INTO github_activity_meta (id, last_updated)
    VALUES (1, ${activity.lastUpdated}::timestamptz)
    ON CONFLICT (id) DO UPDATE SET last_updated = EXCLUDED.last_updated
  `
  console.log(`Metadata set: lastUpdated = ${activity.lastUpdated}`)

  // Verify
  const commitCount = await sql`SELECT COUNT(*) as count FROM commits_by_repo_day`
  const repoCount = await sql`SELECT COUNT(*) as count FROM repo_stats`
  console.log(`\nVerification:`)
  console.log(`  commits_by_repo_day rows: ${commitCount[0].count}`)
  console.log(`  repo_stats rows: ${repoCount[0].count}`)

  console.log("\nMigration complete!")
}

main().catch((err) => {
  console.error("Migration error:", err)
  process.exit(1)
})
