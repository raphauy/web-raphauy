import type { Metadata } from "next"
import { Geist, Geist_Mono, Alfa_Slab_One } from "next/font/google"
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

const alfaSlabOne = Alfa_Slab_One({
  variable: "--font-alfa-slab",
  weight: "400",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Raphael Carvalho — Software Engineer",
    template: "%s — Raphael Carvalho",
  },
  description:
    "Portfolio of Raphael Carvalho, software engineer. Co-founder & CTO at Bond and OnMind. 45+ projects built with modern technologies like Next.js, React, TypeScript, and AI.",
  metadataBase: new URL("https://raphauy.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Raphael Carvalho — Software Engineer",
    description:
      "Portfolio of Raphael Carvalho, software engineer. Co-founder & CTO at Bond and OnMind. 45+ projects built with modern technologies.",
    url: "https://raphauy.dev",
    siteName: "raphauy.dev",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 971,
        height: 384,
        alt: "Raphael Carvalho — Software Engineer Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Raphael Carvalho — Software Engineer",
    description:
      "Portfolio of Raphael Carvalho, software engineer. 45+ projects built with modern technologies.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${alfaSlabOne.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
      </body>
    </html>
  )
}
