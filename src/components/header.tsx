import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Linkedin, Instagram } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <div className="flex items-start gap-4">
          <Image
            src="/photo.png"
            alt="Raphael Carvalho"
            width={80}
            height={80}
            className="rounded-full shrink-0"
          />
          <div className="flex flex-col gap-0.5">
            <h1 className="font-[family-name:var(--font-alfa-slab)] text-2xl tracking-tight sm:text-3xl">
              Raphael Carvalho
            </h1>
            <p className="text-sm text-muted-foreground sm:text-base">
              Software Engineer · Co-founder & CTO at{" "}
              <Link
                href="https://bondsquad.ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                Bond
              </Link>
              {" "}and{" "}
              <Link
                href="https://www.onmindcrm.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline-offset-4 hover:underline"
              >
                OnMind
              </Link>
            </p>
            <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
              Building modern web applications and shipping fast.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:raphael@rapha.uy"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Email"
          >
            <Mail className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/raphauy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="GitHub"
          >
            <Github className="h-4 w-4" />
          </a>
          <a
            href="https://linkedin.com/in/raphauy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-4 w-4" />
          </a>
          <a
            href="https://instagram.com/raphauy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Instagram"
          >
            <Instagram className="h-4 w-4" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
