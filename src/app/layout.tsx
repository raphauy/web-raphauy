import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { TooltipProvider } from "@/components/ui/tooltip"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Raphael — Freelance Software Engineer",
  description:
    "Portfolio de Raphael, freelance software engineer. 30+ proyectos de software construidos con tecnologías modernas.",
  metadataBase: new URL("https://raphauy.dev"),
  openGraph: {
    title: "Raphael — Freelance Software Engineer",
    description:
      "Portfolio de Raphael, freelance software engineer. 30+ proyectos de software construidos con tecnologías modernas.",
    type: "website",
  },
}

const themeScript = `
(function() {
  var stored = localStorage.getItem('theme');
  if (stored === 'light') return;
  if (stored === 'dark' || !window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.documentElement.classList.add('dark');
  }
})();
`

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
