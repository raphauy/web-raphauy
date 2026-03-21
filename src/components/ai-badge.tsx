"use client"

import { Sparkles } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface AIBadgeProps {
  tool: string
  details?: string | null
  size?: "sm" | "md"
}

export function AIBadge({ tool, details, size = "sm" }: AIBadgeProps) {
  const badge = (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border border-violet-500/25 bg-gradient-to-r from-violet-500/15 via-fuchsia-500/10 to-cyan-500/15 font-medium text-violet-600 shadow-[0_0_8px_-2px_rgba(139,92,246,0.3)] dark:border-violet-400/20 dark:from-violet-500/10 dark:via-fuchsia-500/8 dark:to-cyan-500/10 dark:text-violet-400 dark:shadow-[0_0_8px_-2px_rgba(139,92,246,0.2)] ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Sparkles className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />
      {tool}
    </span>
  )

  if (!details) return badge

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs text-sm">{details}</p>
      </TooltipContent>
    </Tooltip>
  )
}
