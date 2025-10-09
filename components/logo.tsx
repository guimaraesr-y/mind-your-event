import { cn } from "@/lib/utils"

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-7 w-7"
      >
        <rect width="28" height="28" rx="8" fill="url(#logo-gradient)" />
        <path
          d="M8 4V8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M20 4V8"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect
          x="6"
          y="14"
          width="4"
          height="4"
          rx="1"
          fill="white"
          fillOpacity="0.5"
        />
        <rect x="12" y="14" width="4" height="4" rx="1" fill="white" />
        <path
          d="M6 10H22"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <defs>
          <linearGradient
            id="logo-gradient"
            x1="0"
            y1="0"
            x2="28"
            y2="28"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="oklch(var(--primary))" />
            <stop offset="1" stopColor="oklch(var(--chart-5))" />
          </linearGradient>
        </defs>
      </svg>
      <h1 className="text-xl font-semibold text-foreground">MindYourEvent</h1>
    </div>
  )
}
