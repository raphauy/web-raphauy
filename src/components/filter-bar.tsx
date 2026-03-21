"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useMemo, useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function FilterBar({ allTechs }: { allTechs: string[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const selectedTechs = useMemo(() => {
    const param = searchParams.get("tech")
    return param ? param.split(",").filter(Boolean) : []
  }, [searchParams])

  const toggleTech = useCallback(
    (tech: string) => {
      const params = new URLSearchParams(searchParams.toString())
      const current = params.get("tech")?.split(",").filter(Boolean) || []

      const next = current.includes(tech)
        ? current.filter((t) => t !== tech)
        : [...current, tech]

      if (next.length === 0) {
        params.delete("tech")
      } else {
        params.set("tech", next.join(","))
      }

      router.push(`?${params.toString()}`, { scroll: false })
    },
    [router, searchParams]
  )

  const clearAll = useCallback(() => {
    router.push("/", { scroll: false })
  }, [router])

  return (
    <div className="mb-8">
      <div>
        {/* Toggle row */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
          Filter
          {selectedTechs.length > 0 && (
            <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-medium text-white">
              {selectedTechs.length}
            </span>
          )}
        </button>

        {/* Collapsible badges */}
        {isOpen && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {allTechs.map((tech) => {
              const isActive = selectedTechs.includes(tech)
              return (
                <button
                  key={tech}
                  onClick={() => toggleTech(tech)}
                  className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-accent bg-accent text-white dark:text-white"
                      : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }`}
                >
                  {tech}
                </button>
              )
            })}
            {selectedTechs.length > 0 && (
              <button
                onClick={clearAll}
                className="ml-1 flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
