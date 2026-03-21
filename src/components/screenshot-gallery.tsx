"use client"

import { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

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
  const [selected, setSelected] = useState<string | null>(null)

  if (screenshots.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {screenshots.map((s) => (
          <button
            key={s}
            onClick={() => setSelected(s)}
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
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setSelected(null)}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-[90vw]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={`/projects/${slug}/screenshots/${selected}`}
                alt={`${projectName} - ${selected}`}
                width={1280}
                height={720}
                className="rounded-lg object-contain"
                priority
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
