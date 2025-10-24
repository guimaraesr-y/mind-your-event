"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Copy, Check, BarChart3, Users, Send } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"
import { useTranslations } from "next-intl"

interface EventDashboardProps {
  event: any
  participants: any[]
}

export function EventDashboard({ event, participants }: EventDashboardProps) {
  const t = useTranslations("EventDashboard")
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set())

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedTokens(new Set(copiedTokens).add(token))
    toast(t("toast.copySuccess"))
    setTimeout(() => {
      setCopiedTokens((prev) => {
        const next = new Set(prev)
        next.delete(token)
        return next
      })
    }, 2000)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    })
  }

  const submittedCount = participants.filter((p) => p.has_submitted).length

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Event Header */}
      <div className="space-y-2">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
        {event.description && <p className="text-muted-foreground max-w-2xl">{event.description}</p>}
      </div>

      {/* View Results Button */}
      {submittedCount > 0 && !event.is_finalized && (
        <Button asChild size="lg" className="w-full">
          <Link href={`/events/${event.id}/results`}>
            <BarChart3 className="mr-2 h-5 w-5" />
            {t("viewResultsButton")}
          </Link>
        </Button>
      )}

      {event.is_finalized && (
        <Button asChild size="lg" className="w-full">
          <Link href={`/events/${event.id}/rsvps`}>
            <Users className="mr-2 h-5 w-5" />
            {t("viewRsvpsButton")}
          </Link>
        </Button>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>{t("detailsTitle")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("organizerLabel")}</p>
              <p className="text-sm text-muted-foreground">
                {event.users.name} ({event.users.email})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("dateRangeLabel")}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </p>
            </div>
          </div>

          {event.start_time && event.end_time && (
            <div className="flex items-start gap-3 col-span-full">
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("preferredTimeLabel")}</p>
                <p className="text-sm text-muted-foreground">
                  {event.start_time} - {event.end_time}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t("participantsTitle")} ({t("responded", { submittedCount: submittedCount, totalCount: participants.length })})
          </CardTitle>
          <CardDescription>{t("participantsDescription")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-background"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{participant.users.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{participant.users.email}</p>
                  </div>
                  {participant.has_submitted && (
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full flex-shrink-0">
                      {t("submitted")}
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(participant.invite_token)}
                  className="ml-2 flex-shrink-0"
                >
                  {copiedTokens.has(participant.invite_token) ? (
                    <Check className="h-4 w-4 text-accent" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-2 hidden sm:inline">{t("copyLink")}</span>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            {t("nextStepsTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-foreground">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">1</div>
            <p>{t("step1")}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">2</div>
            <p>{t("step2")}</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">3</div>
            <p>{t("step3")}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}