"use client"

import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "./logo"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Logo />
            </Link>
            <LanguageSwitcher />
          </div>
        </header>
  )
}
