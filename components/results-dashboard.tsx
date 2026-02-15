"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, TrendingUp, ArrowLeft, Trophy } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { AvailabilityHeatmap } from "@/components/availability-heatmap"
import { ParticipantsList } from "@/components/participants-list"
import { ConfirmEventDialog } from "@/components/finalize-event-dialog"
import { useFormatter, useTranslations } from "next-intl"
import { EventMetricsService } from "@/modules/events/services/event-metrics.service"

interface ResultsDashboardProps {
  event: any
  participants: any[]
  availabilitySlots: any[]
}


export function ResultsDashboard({ event, participants, availabilitySlots }: ResultsDashboardProps) {
  const t = useTranslations("ResultsDashboard")
  const format = useFormatter()

  const metrics = useMemo(() => {
    const service = new EventMetricsService()
    return service.calculate(participants, availabilitySlots)
  }, [participants, availabilitySlots])

  const { totalParticipants, submittedCount, responseRate, bestSlots } = metrics
  const bestSlot = bestSlots[0]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return format.dateTime(date, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":").map(Number)
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return format.dateTime(date, { hour: "numeric", minute: "2-digit" })
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {t("backLink")}
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{t("title", { eventTitle: event.title })}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
      </div>

      {!event.is_finalized && bestSlot && (
        <ConfirmEventDialog
          eventId={event.id}
          suggestedDate={bestSlot.date}
          suggestedStartTime={bestSlot.startTime}
          suggestedEndTime={bestSlot.endTime}
        />
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.participants")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.responses")}</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {submittedCount} / {totalParticipants}
            </div>
            <p className="text-xs text-muted-foreground">
              {t("stats.responseRate", { rate: responseRate })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("stats.slots")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{availabilitySlots.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Best Time Slots */}
      {bestSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {t("bestSlots.title")}
            </CardTitle>
            <CardDescription>{t("bestSlots.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSlots.map((slot, index) => (
                <div
                  key={`${slot.date}-${slot.startTime}-${slot.endTime}`}
                  className="flex items-center justify-between p-4 rounded-lg border bg-background"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 ${index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted"
                        }`}
                    >
                      <span className="font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground">{formatDate(slot.date)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-lg font-bold text-foreground">
                      {slot.count}/{totalParticipants}
                    </p>
                    <p className="text-xs text-muted-foreground">{t("available", { percentage: Math.round(slot.percentage) })}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Heatmap */}
      <AvailabilityHeatmap
        event={event}
        dateAvailability={metrics.dateAvailability}
        totalParticipants={totalParticipants}
      />

      {/* Participants List */}
      <ParticipantsList participants={participants} availabilitySlots={availabilitySlots} />

      {submittedCount < totalParticipants && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              {t("waiting", { count: totalParticipants - submittedCount })}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}