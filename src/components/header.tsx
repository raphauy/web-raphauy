import Image from "next/image"
import Link from "next/link"
import { Mail, Github, Linkedin, Instagram } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"

export function Header() {
  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="flex items-start gap-4">
          <Image
            src="/photo.png"
            alt="Raphael Carvalho"
            width={96}
            height={96}
            className="h-[90px] w-[90px] rounded-full shrink-0 sm:h-[106px] sm:w-[106px]"
          />
          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-[family-name:var(--font-alfa-slab)] text-2xl tracking-tight sm:text-3xl">
                Raphael Carvalho
              </h1>
              {/* Social icons - desktop inline, mobile hidden here */}
              <div className="hidden shrink-0 items-center gap-2 sm:flex">
                <SocialIcons />
                <ThemeToggle />
              </div>
            </div>
            <p className="text-sm text-muted-foreground sm:text-base">
              Software Engineer
            </p>
            <p className="text-sm text-muted-foreground sm:text-base">
              Co-founder & CTO at{" "}
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
            <p className="text-sm text-muted-foreground">
              Building modern web applications and shipping fast.
            </p>
          </div>
        </div>

        {/* Social icons - mobile row below, centered */}
        <div className="mt-4 flex items-center justify-center gap-2 sm:hidden">
          <SocialIcons />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

function SocialIcons() {
  const links = [
    { href: "mailto:raphael@rapha.uy", label: "Email", icon: Mail },
    { href: "https://github.com/raphauy", label: "GitHub", icon: Github },
    { href: "https://linkedin.com/in/raphauy", label: "LinkedIn", icon: Linkedin },
    { href: "https://instagram.com/raphauy", label: "Instagram", icon: Instagram },
  ]

  return (
    <>
      {links.map(({ href, label, icon: Icon }) => (
        <a
          key={label}
          href={href}
          target={href.startsWith("mailto:") ? undefined : "_blank"}
          rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
          className="flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground"
          aria-label={label}
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </>
  )
}
