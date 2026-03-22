import { revalidateTag } from "next/cache"
import { sql } from "@/lib/db"
import { Octokit } from "@octokit/rest"

export const maxDuration = 60

export async function GET(request: Request) {
  // Verify CRON_SECRET
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.log("[cron] Unauthorized request")
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const token = process.env.GITHUB_TOKEN
  if (!token) {
    console.log("[cron] GITHUB_TOKEN not configured")
    return Response.json({ error: "GITHUB_TOKEN not configured" }, { status: 500 })
  }

  const octokit = new Octokit({ auth: token })

  // Get last_updated timestamp
  const metaRows = await sql`SELECT last_updated FROM github_activity_meta WHERE id = 1`
  const lastUpdated = metaRows[0]?.last_updated
    ? new Date(metaRows[0].last_updated)
    : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago fallback

  console.log(`[cron] Starting update. Last updated: ${lastUpdated.toISOString()}`)

  // Get all tracked repos
  const repos = await sql`SELECT repo_key FROM repo_stats`
  if (repos.length === 0) {
    console.log("[cron] No repos tracked, nothing to do")
    return Response.json({ status: "ok", message: "No repos tracked" })
  }

  console.log(`[cron] Processing ${repos.length} repos...`)

  let totalNewCommits = 0
  let reposUpdated = 0
  const errors: string[] = []

  // Process repos in batches of 10
  const BATCH_SIZE = 10
  for (let i = 0; i < repos.length; i += BATCH_SIZE) {
    const batch = repos.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    console.log(`[cron] Batch ${batchNum}: ${batch.map((r) => r.repo_key).join(", ")}`)

    const results = await Promise.allSettled(
      batch.map(async (row) => {
        const repoKey = row.repo_key as string
        const [owner, repo] = repoKey.split("/")
        let repoNewCommits = 0

        try {
          // Fetch repo info for stars/forks update
          const { data: repoData } = await octokit.rest.repos.get({ owner, repo })

          // Fetch commits since lastUpdated
          const commitDays: Record<string, number> = {}
          let page = 1
          let totalFetched = 0

          while (true) {
            const { data: commits, headers } = await octokit.rest.repos.listCommits({
              owner,
              repo,
              since: lastUpdated.toISOString(),
              per_page: 100,
              page,
            })

            if (commits.length === 0) break

            for (const commit of commits) {
              const date = commit.commit.author?.date
              if (!date) continue
              const day = date.slice(0, 10)
              commitDays[day] = (commitDays[day] || 0) + 1
              totalFetched++
            }

            const remaining = parseInt(headers["x-ratelimit-remaining"] || "999")
            if (remaining < 10) {
              const resetTime = parseInt(headers["x-ratelimit-reset"] || "0") * 1000
              const waitMs = Math.max(0, resetTime - Date.now()) + 1000
              console.log(`[cron] Rate limit low (${remaining}), waiting ${Math.ceil(waitMs / 1000)}s...`)
              await new Promise((resolve) => setTimeout(resolve, waitMs))
            }

            const linkHeader = headers.link || ""
            if (!linkHeader.includes('rel="next"')) break
            page++
          }

          // UPSERT commits
          for (const [date, count] of Object.entries(commitDays)) {
            await sql`
              INSERT INTO commits_by_repo_day (repo_key, commit_date, commit_count)
              VALUES (${repoKey}, ${date}::date, ${count})
              ON CONFLICT (repo_key, commit_date) DO UPDATE SET commit_count = EXCLUDED.commit_count
            `
          }

          // Fetch languages
          const { data: languages } = await octokit.rest.repos.listLanguages({ owner, repo })

          // Update repo_stats
          const totalCommitsResult = await sql`
            SELECT SUM(commit_count)::int as total FROM commits_by_repo_day WHERE repo_key = ${repoKey}
          `
          const lastCommitResult = await sql`
            SELECT MAX(commit_date)::text as last_date FROM commits_by_repo_day WHERE repo_key = ${repoKey}
          `

          await sql`
            UPDATE repo_stats SET
              stars = ${repoData.stargazers_count},
              forks = ${repoData.forks_count},
              languages = ${JSON.stringify(languages)}::jsonb,
              total_commits = ${totalCommitsResult[0]?.total || 0},
              last_commit_date = ${lastCommitResult[0]?.last_date || null}::date,
              description = ${repoData.description},
              updated_at = NOW()
            WHERE repo_key = ${repoKey}
          `

          repoNewCommits = totalFetched
          if (totalFetched > 0) {
            reposUpdated++
            console.log(`[cron] ${repoKey}: ${totalFetched} commits found (${Object.keys(commitDays).length} days)`)
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err)
          errors.push(`${repoKey}: ${message}`)
          console.log(`[cron] ERROR ${repoKey}: ${message}`)
        }

        return repoNewCommits
      }),
    )

    for (const result of results) {
      if (result.status === "fulfilled") {
        totalNewCommits += result.value
      }
    }
  }

  // Update last_updated
  await sql`
    INSERT INTO github_activity_meta (id, last_updated)
    VALUES (1, NOW())
    ON CONFLICT (id) DO UPDATE SET last_updated = NOW()
  `

  // Invalidate cache
  revalidateTag("github-activity", "days")

  console.log(`[cron] Done. ${totalNewCommits} new commits, ${reposUpdated}/${repos.length} repos updated.${errors.length > 0 ? ` Errors: ${errors.length}` : ""}`)

  return Response.json({
    status: "ok",
    newCommits: totalNewCommits,
    reposUpdated,
    totalRepos: repos.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
