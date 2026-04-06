"use client"

import Link from "next/link"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Logo } from "./logo"
import { Info } from "lucide-react"
import { Button } from "./ui/button"
import { NotificationDropdown } from "@/components/notifications"

interface HeaderProps {
  onShowTutorial?: () => void
}

export function Header({ onShowTutorial }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Logo />
        </Link>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          {onShowTutorial && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowTutorial}
              className="walkthrough-trigger text-muted-foreground hover:text-foreground"
            >
              <Info className="h-5 w-5" />
            </Button>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  )
}
