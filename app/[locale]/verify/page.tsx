'use client'

import { Header } from "@/components/header"
import { VerifyEmailForm } from "@/components/verify-email-form"
import { useRouter, useSearchParams } from 'next/navigation'

export default function VerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email");
  const redirect = searchParams.get("redirect");

  const redirectBack = () => {
    router.push(redirect || "/");
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 md:py-20">
        <VerifyEmailForm
          initialEmail={email || ""}
          callback={redirectBack}
          />
      </main>
    </div>
  )
}
