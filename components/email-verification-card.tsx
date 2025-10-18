'use client';

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Shield } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"

interface EmailVerificationRequiredCardProps {
  requiredEmail?: string
}

export function EmailVerificationRequiredCard({
  requiredEmail,
}: EmailVerificationRequiredCardProps) {
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
            Email Verification Required
          </CardTitle>
          <CardDescription>Please verify your email address to submit your availability.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            To ensure security and prevent unauthorized submissions, we need to verify your email address{" "}
            <strong>({requiredEmail || "your email"})</strong>.
          </p>
          <Button onClick={handleVerifyEmail} className="w-full">
            Verify Email
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
