"use client"

import type React from "react"
import Cookies from "js-cookie";

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { toast } from "react-toastify"
import { SESSION_COOKIE_NAME } from "@/contexts/auth-context";

interface VerifyEmailFormProps {
  initialEmail?: string,
  callback?: () => void
}

export function VerifyEmailForm({
  initialEmail = "",
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

      toast.success(t("toast.sendSuccess"))
      setStep("code")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.sendErrorFallback"), {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const submitCode = async (currentCode: string) => {
    if (currentCode.length !== 6) return
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token: currentCode }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("toast.verifyError"))
      }

      const data = await response.json();
      Cookies.set(SESSION_COOKIE_NAME, data.sessionToken, { path: '/' });

      toast.success(t("toast.verifySuccess"), {
        autoClose: 500,
        onClose: () => {
          if (callback) {
            callback();
          }
        }
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("toast.verifyErrorFallback"), {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    submitCode(code)
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
              <div className="flex justify-between gap-2">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <Input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    inputMode="numeric"
                    pattern="\d*"
                    value={code[index] || ""}
                    onChange={(e) => {
                      const typedValue = e.target.value.replace(/\D/g, "");
                      const val = typedValue.slice(-1); // Take the last character

                      const newCode = code.split("");
                      // Ensure the array has length 6
                      while (newCode.length < 6) newCode.push("");

                      newCode[index] = val;
                      const completeCode = newCode.join("").slice(0, 6);
                      setCode(completeCode);

                      if (val && index < 5) {
                        const nextInput = document.getElementById(`code-${index + 1}`);
                        nextInput?.focus();
                      }

                      if (completeCode.length === 6) {
                        submitCode(completeCode);
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !code[index]) {
                        const prevInput = document.getElementById(`code-${index - 1}`);
                        prevInput?.focus();
                      }
                    }}
                    onPaste={(e) => {
                      e.preventDefault();
                      const pastedData = e.clipboardData.getData("text").slice(0, 6).replace(/\D/g, "");
                      if (pastedData) {
                        setCode(pastedData);
                        if (pastedData.length === 6) {
                          submitCode(pastedData);
                        } else {
                          const nextId = Math.min(pastedData.length, 5);
                          document.getElementById(`code-${nextId}`)?.focus();
                        }
                      }
                    }}
                    className="h-12 w-full text-center text-xl font-bold p-0"
                    autoFocus={index === 0}
                    required
                  />
                ))}
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