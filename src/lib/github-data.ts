import fs from "fs"
import path from "path"
import { GitHubActivityData } from "./types"

const dataPath = path.join(process.cwd(), "data", "github-activity.json")

export function getGitHubActivity(): GitHubActivityData | null {
  if (!fs.existsSync(dataPath)) return null
  const raw = fs.readFileSync(dataPath, "utf-8")
  return JSON.parse(raw) as GitHubActivityData
}
