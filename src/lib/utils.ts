import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const knownTools = ["Claude Code", "Cursor", "Copilot", "Aider", "Windsurf"]

export function extractAITool(aiDetails: string | null | undefined): string {
  if (!aiDetails) return "AI"
  for (const tool of knownTools) {
    if (aiDetails.toLowerCase().includes(tool.toLowerCase())) return tool
  }
  return "AI"
}
