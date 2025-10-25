"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useTranslations } from "next-intl"

interface RsvpCardProps {
  eventId: string
  inviteToken: string
  currentRsvp: boolean | null
}

export function RsvpCard({ eventId, inviteToken, currentRsvp }: RsvpCardProps) {
  const t = useTranslations("RsvpCard");
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRsvp = async (willAttend: boolean) => {
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/rsvp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteToken, willAttend }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("toast.error"))
      }

      toast(willAttend ? t("toast.attending") : t("toast.declined"))

      router.refresh()
    } catch (error) {
      toast(error instanceof Error ? error.message : t("toast.error"), {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button
            onClick={() => handleRsvp(true)}
            disabled={isLoading}
            variant={currentRsvp === true ? "default" : "outline"}
            className="flex-1"
          >
            {isLoading && currentRsvp !== true ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            {t("attendButton")}
          </Button>
          <Button
            onClick={() => handleRsvp(false)}
            disabled={isLoading}
            variant={currentRsvp === false ? "destructive" : "outline"}
            className="flex-1"
          >
            {isLoading && currentRsvp !== false ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <X className="mr-2 h-4 w-4" />
            )}
            {t("declineButton")}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
