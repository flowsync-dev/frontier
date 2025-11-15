import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Frontier - Nigerian E-Commerce SaaS",
  description: "Create your online store in minutes. Manage inventory, track sales, and reach customers worldwide.",
  generator: "v0.app",
  openGraph: {
    title: "Frontier - Nigerian E-Commerce SaaS",
    description: "Create your online store in minutes. Manage inventory, track sales, and reach customers worldwide.",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
