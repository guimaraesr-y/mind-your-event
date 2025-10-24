"use client"

import type React from "react"

import { useState } from "react"
import { useTranslations } from "next-intl"
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
  const t = useTranslations("VerifyEmailForm")
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
        throw new Error(error.error || t("toast.sendError"))
      }

      toast(t("toast.sendSuccess"))
      setStep("code")
    } catch (error) {
      toast(error instanceof Error ? error.message : t("toast.sendErrorFallback"), {
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
        throw new Error(error.error || t("toast.verifyError"))
      }

      toast(t("toast.verifySuccess"), {
        autoClose: 500,
        onClose: () => {
          if (callback) {
            callback();
          }
        }
      })
    } catch (error) {
      toast(error instanceof Error ? error.message : t("toast.verifyErrorFallback"), {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {step === "email"
            ? t("description.email")
            : t("description.code")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {step === "email" ? (
          <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="sr-only">
                {t("emailLabel")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
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
                  {t("sendingCodeButton")}
                </>
              ) : (
                t("sendCodeButton")
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code" className="sr-only">
                {t("codeLabel")}
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="code"
                  type="text"
                  placeholder={t("codePlaceholder")}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-10 text-center tracking-[0.5em]"
                  maxLength={6}
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground text-center">{t("codeSentTo", { email })}</p>
            </div>

            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("verifyingButton")}
                  </>
                ) : (
                  t("verifyCodeButton")
                )}
              </Button>

              <Button type="button" variant="link" className="w-full" onClick={() => setStep("email")}>
                {t("differentEmailButton")}
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}