"use client"

import { useLocale } from "next-intl"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Globe } from "lucide-react"
import Cookies from "js-cookie";

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()

  const handleSwitchLanguage = (nextLocale: string) => {
    Cookies.set("USER_LOCALE", nextLocale)
    router.refresh();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="default" className="hover:bg-primary hover:text-primary-foreground">
          <div className="flex items-center justify-center gap-2">
            <span>{locale.toUpperCase()}</span>
            <Globe className="h-5 w-5" />
            <span className="sr-only">Switch language</span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleSwitchLanguage("en")}>
          English
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleSwitchLanguage("pt")}>
          Português
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
