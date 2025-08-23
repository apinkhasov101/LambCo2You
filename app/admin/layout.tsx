import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Configuration - Site Selector",
  description: "Administrative configuration panel for the AI-powered site selector platform",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
