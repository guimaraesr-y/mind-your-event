"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requiredEmail?: string
}

export function AuthGuard({ children, requiredEmail }: AuthGuardProps) {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken")
    const userEmail = localStorage.getItem("userEmail")

    if (!sessionToken || !userEmail) {
      router.push("/verify")
      return
    }

    if (requiredEmail && userEmail !== requiredEmail) {
      router.push("/verify")
      return
    }

    setIsAuthenticated(true)
    setIsLoading(false)
  }, [router, requiredEmail])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
