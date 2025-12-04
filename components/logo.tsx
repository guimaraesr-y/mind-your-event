import { cn } from "@/lib/utils"
import Image from "next/image"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Image src="/mindyourevent-logo.png" alt="logo" width={24} height={24} />
      <h1 className="text-xl font-semibold text-foreground">
        MindYour<span className="text-primary">Event</span>
      </h1>
    </div>
  )
}
