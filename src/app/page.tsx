import { Suspense } from "react"
import { getAllProjects, getAllTechs } from "@/lib/projects"
import { getGitHubActivity } from "@/lib/github-data"
import { Header } from "@/components/header"
import { HomeContent } from "@/components/home-content"

export default function Home() {
  const projects = getAllProjects()
  const allTechs = getAllTechs()
  const githubActivity = getGitHubActivity()

  return (
    <>
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
