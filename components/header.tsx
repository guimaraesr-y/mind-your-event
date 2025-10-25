"use client"

import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Calendar } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                MindYourEvent
              </h1>
            </Link>
            <LanguageSwitcher />
          </div>
        </header>
  )
}
