import type { MetadataRoute } from "next"
import { getAllProjects } from "@/lib/projects"

export default function sitemap(): MetadataRoute.Sitemap {
  const projects = getAllProjects()

  const projectUrls: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `https://raphauy.dev/projects/${project.slug}`,
    lastModified: project.endDate ?? project.startDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }))

  return [
    {
      url: "https://raphauy.dev",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...projectUrls,
  ]
}
