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

  const ogImage = project.screenshots.length > 0
    ? `/projects/${slug}/screenshots/${project.screenshots[0]}`
    : "/og-image.png"

  return {
    title: project.name,
    description: project.tagline,
    alternates: {
      canonical: `/projects/${slug}`,
    },
    openGraph: {
      title: `${project.name} — Raphael Carvalho`,
      description: project.tagline,
      url: `https://raphauy.dev/projects/${slug}`,
      type: "article",
      images: [
        {
          url: ogImage,
          alt: project.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} — Raphael Carvalho`,
      description: project.tagline,
      images: [ogImage],
    },
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: project.name,
    description: project.tagline,
    author: {
      "@type": "Person",
      name: "Raphael Carvalho",
      url: "https://raphauy.dev",
    },
    programmingLanguage: project.tech,
    ...(project.url && { url: project.url }),
    ...(project.repoUrl && { codeRepository: project.repoUrl }),
    dateCreated: project.startDate,
    ...(project.endDate && { dateModified: project.endDate }),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProjectDetail project={project} prevSlug={prevSlug} nextSlug={nextSlug} />
    </>
  )
}
