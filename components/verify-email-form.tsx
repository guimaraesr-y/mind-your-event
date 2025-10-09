"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail, KeyRound } from "lucide-react"
import { toast } from "react-toastify"

interface VerifyEmailFormProps {
  initialEmail?: string,
  callback?: () => void
}

export function VerifyEmailForm({
  initialEmail="",
  callback
}: VerifyEmailFormProps) {
  const [step, setStep] = useState<"email" | "code">("email")
  const [email, setEmail] = useState(initialEmail)
  const [code, setCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to send verification code")
      }

      toast("Code sent! Check your email for the verification code.")
      setStep("code")
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to send code", {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: code }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Invalid verification code")
      }

      const data = await response.json()

      // Store session token in localStorage
      localStorage.setItem("sessionToken", data.sessionToken)
      localStorage.setItem("userEmail", data.email)

      toast("Verified! You are now authenticated.", {
        autoClose: 500,
        onClose: () => {
          if (callback) {
            callback();
          }
        }
      })
    } catch (error) {
      toast(error instanceof Error ? error.message : "Verification failed", {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Email Verification</CardTitle>
        <CardDescription>
          {step === "email"
            ? "Enter your email to receive a one-time verification code."
            : "Enter the 6-digit code sent to your email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="cursor-pointer w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="sr-only">
                Verification Code
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10 text-center tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">A 6-digit code was sent to {email}</p>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <Button type="button" variant="link" className="w-full" onClick={() => setStep("email")}>
                Use a different email address
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
