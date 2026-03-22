import { Suspense } from "react"
import { getAllProjects, getAllTechs } from "@/lib/projects"
import { getGitHubActivity } from "@/lib/github-data"
import { Header } from "@/components/header"
import { HomeContent } from "@/components/home-content"

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Raphael Carvalho",
  url: "https://raphauy.dev",
  jobTitle: "Software Engineer",
  description:
    "Software Engineer. Co-founder & CTO at Bond and OnMind. Building modern web applications and shipping fast.",
  sameAs: [
    "https://github.com/raphauy",
    "https://linkedin.com/in/raphauy",
    "https://instagram.com/raphauy",
  ],
  image: "https://raphauy.dev/photo.png",
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "Tailwind CSS",
    "PostgreSQL",
    "AI",
  ],
}

export default async function Home() {
  const projects = getAllProjects()
  const allTechs = getAllTechs()
  const githubActivity = await getGitHubActivity()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <Suspense>
        <HomeContent
          projects={projects}
          allTechs={allTechs}
          commitsByDay={githubActivity?.commitsByDay ?? null}
        />
      </Suspense>
    </>
  )
}
