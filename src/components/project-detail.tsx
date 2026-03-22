"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, ArrowRight, ExternalLink, Github, Lock } from "lucide-react"
import { Project } from "@/lib/types"
import { extractAITool } from "@/lib/utils"
import { TechBadge } from "./tech-badge"
import { AIBadge } from "./ai-badge"
import { StatsBar } from "./stats-bar"
import { ScreenshotGallery } from "./screenshot-gallery"

function formatDate(dateStr: string): string {
  const [year, month] = dateStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function getDuration(start: string, end: string | null): string {
  if (!end) return `${formatDate(start)} — Present`
  return `${formatDate(start)} — ${formatDate(end)}`
}

interface ProjectDetailProps {
  project: Project
  prevSlug: string | null
  nextSlug: string | null
}

export function ProjectDetail({
  project,
  prevSlug,
  nextSlug,
}: ProjectDetailProps) {
  const heroScreenshot = project.screenshots[0]

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      {/* Back link */}
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Hero */}
      {heroScreenshot && (
        <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-xl border border-border">
          <Image
            src={`/projects/${project.slug}/screenshots/${heroScreenshot}`}
            alt={project.name}
            fill
            className="object-cover object-top"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-1 text-lg text-white/80">{project.tagline}</p>
          </div>
        </div>
      )}

      {!heroScreenshot && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {project.name}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {project.tagline}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-8 lg:col-span-2">
          {/* Description */}
          <section>
            <h2 className="mb-3 text-lg font-semibold">About</h2>
            <p className="leading-relaxed text-muted-foreground">
              {project.description}
            </p>
          </section>

          {/* Highlights */}
          {project.highlights.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Highlights</h2>
              <ul className="space-y-2">
                {project.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-2 text-muted-foreground"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {h}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Screenshots */}
          {project.screenshots.length > 1 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold">Screenshots</h2>
              <ScreenshotGallery
                slug={project.slug}
                screenshots={project.screenshots}
                projectName={project.name}
              />
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tech stack */}
          <section>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Tech Stack
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {project.tech.map((t) => (
                <TechBadge key={t} name={t} />
              ))}
            </div>
          </section>

          {/* AI Badge */}
          {project.builtWithAI && (
            <section>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">
                AI-Assisted
              </h3>
              <AIBadge
                tool={extractAITool(project.aiDetails)}
                details={project.aiDetails}
                size="md"
              />
            </section>
          )}

          {/* Stats */}
          <section>
            <h3 className="mb-2 text-sm font-medium text-muted-foreground">
              Code Stats
            </h3>
            <StatsBar stats={project.stats} />
          </section>

          {/* Duration */}
          <section>
            <h3 className="mb-1 text-sm font-medium text-muted-foreground">
              Duration
            </h3>
            <p className="text-sm">
              {getDuration(project.startDate, project.endDate)}
            </p>
          </section>

          {/* Links */}
          <section className="flex flex-col gap-2">
            {project.url && (
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent-hover"
              >
                <ExternalLink className="h-4 w-4" />
                Visit site
              </a>
            )}
            {project.repoUrl && !project.repoPrivate && (
              <a
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent transition-colors hover:text-accent-hover"
              >
                <Github className="h-4 w-4" />
                View source
              </a>
            )}
            {project.repoPrivate && (
              <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                <Lock className="h-3.5 w-3.5" />
                Private repository
              </span>
            )}
          </section>
        </div>
      </div>

      {/* Prev/Next navigation */}
      <div className="mt-12 flex items-center justify-between border-t border-border pt-6">
        {prevSlug ? (
          <Link
            href={`/projects/${prevSlug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Link>
        ) : (
          <div />
        )}
        {nextSlug ? (
          <Link
            href={`/projects/${nextSlug}`}
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  )
}
