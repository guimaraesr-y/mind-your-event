'use client';

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations } from "next-intl";

interface EmailVerificationRequiredCardProps {
  requiredEmail?: string
}

export function EmailVerificationRequiredCard({
  requiredEmail,
}: EmailVerificationRequiredCardProps) {
  const t = useTranslations("EmailVerificationCard");
  const router = useRouter()
  const pathname = usePathname()

  const handleVerifyEmail = () => {
    const url = new URL("/verify", window.location.origin);
    url.searchParams.set("email", requiredEmail || "");
    url.searchParams.set("redirect", pathname);

    router.push(url.toString());
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-primary/5 border-primary/20 text-center">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 justify-center">
            <Shield className="h-6 w-6" />
            {t("title")}
          </CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {t.rich("content", {
              strong_email: (chunks) => <strong>({requiredEmail || t("defaultEmail")})</strong>,
            })}
            {/* {t("content", { email: requiredEmail || t("defaultEmail") })} */}
          </p>
          <Button onClick={handleVerifyEmail} className="w-full">
            {t("button")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
