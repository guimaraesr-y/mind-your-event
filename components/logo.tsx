import { cn } from "@/lib/utils"
import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/mindyourevent-logo.png" alt="logo" width={24} height={24} />
      <h1 className="hidden md:block text-xl font-bold text-foreground tracking-tight">
        MindYour<span className="text-gradient">Event</span>
      </h1>
      <h1 className="block md:hidden text-xl font-bold text-foreground tracking-tight">
        M<span className="text-gradient">E</span>
      </h1>
    </div>
  )
}
