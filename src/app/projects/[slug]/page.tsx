import { notFound } from "next/navigation"
import { getAllProjects, getProjectBySlug, getProjectSlugs } from "@/lib/projects"
import { ProjectDetail } from "@/components/project-detail"
import type { Metadata } from "next"

export function generateStaticParams() {
  return getProjectSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) return {}

  return {
    title: `${project.name} — Raphael`,
    description: project.tagline,
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const project = getProjectBySlug(slug)
  if (!project) notFound()

  const allProjects = getAllProjects()
  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const prevSlug = currentIndex > 0 ? allProjects[currentIndex - 1].slug : null
  const nextSlug =
    currentIndex < allProjects.length - 1
      ? allProjects[currentIndex + 1].slug
      : null

  return <ProjectDetail project={project} prevSlug={prevSlug} nextSlug={nextSlug} />
}
