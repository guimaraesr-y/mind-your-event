"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Check, Clock } from "lucide-react"
import { useTranslations } from "next-intl"

interface ParticipantsListProps {
  participants: any[]
  availabilitySlots: any[]
}

export function ParticipantsList({ participants, availabilitySlots }: ParticipantsListProps) {
  const t = useTranslations("ParticipantsList")

  const getParticipantSlots = (userId: string) => {
    return availabilitySlots.filter((slot) => slot.user_id === userId)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.map((participant) => {
            const slots = getParticipantSlots(participant.user_id)
            const uniqueDates = new Set(slots.map((s) => s.date)).size

            return (
              <div
                key={participant.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{participant.users.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{participant.users.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-shrink-0 ml-4">
                  {participant.has_submitted ? (
                    <>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">{t("timeSlots", { count: slots.length })}</p>
                        <p className="text-xs text-muted-foreground">{t("days", { count: uniqueDates })}</p>
                      </div>
                      <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center">
                        <Check className="h-4 w-4 text-accent" />
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{t("pending")}</p>
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}