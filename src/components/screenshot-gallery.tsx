"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface ScreenshotGalleryProps {
  slug: string
  screenshots: string[]
  projectName: string
}

export function ScreenshotGallery({
  slug,
  screenshots,
  projectName,
}: ScreenshotGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const goNext = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i < screenshots.length - 1 ? i + 1 : i))
  }, [screenshots.length])

  const goPrev = useCallback(() => {
    setSelectedIndex((i) => (i !== null && i > 0 ? i - 1 : i))
  }, [])

  const close = useCallback(() => setSelectedIndex(null), [])

  useEffect(() => {
    if (selectedIndex === null) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext()
      else if (e.key === "ArrowLeft") goPrev()
      else if (e.key === "Escape") close()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedIndex, goNext, goPrev, close])

  if (screenshots.length === 0) return null

  const selected = selectedIndex !== null ? screenshots[selectedIndex] : null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenshots.map((s, i) => (
          <button
            key={s}
            onClick={() => setSelectedIndex(i)}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-lg border border-border"
          >
            <Image
              src={`/projects/${slug}/screenshots/${s}`}
              alt={`${projectName} - ${s}`}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selected && selectedIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={close}
          >
            {/* Close button */}
            <button
              onClick={close}
              className="absolute right-4 top-4 z-10 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Previous arrow */}
            {selectedIndex > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); goPrev() }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Previous screenshot"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Next arrow */}
            {selectedIndex < screenshots.length - 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); goNext() }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                aria-label="Next screenshot"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-h-[90vh] max-w-[90vw] overflow-y-auto rounded-lg lightbox-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={`/projects/${slug}/screenshots/${selected}`}
                alt={`${projectName} - ${selected}`}
                width={1280}
                height={720}
                className="w-full rounded-lg"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
