"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Loader2, Check, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"
import { useTranslations, useFormatter } from "next-intl"

interface AvailabilityFormProps {
  event: any
  participant: any
  creator: any
  existingAvailability: any[]
}

interface TimeSlot {
  date: string
  startTime: string
  endTime: string
}

export function AvailabilityForm({
  event,
  participant,
  creator,
  existingAvailability,
}: AvailabilityFormProps) {
  const router = useRouter()
  const t = useTranslations("AvailabilityForm")
  const format = useFormatter()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(
    existingAvailability.map((slot) => ({
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
    })),
  )

  // Generate date range
  const dateRange = useMemo(() => {
    const dates: Date[] = []
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }
    return dates
  }, [event.start_date, event.end_date])

  const formatDate = (date: Date) => {
    return format.dateTime(date, {
      weekday: "long",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const addTimeSlot = (date: string) => {
    const defaultStart = event.start_time || "09:00"
    const defaultEnd = event.end_time || "17:00"

    setSelectedSlots([...selectedSlots, { date, startTime: defaultStart, endTime: defaultEnd }])
  }

  const removeTimeSlot = (index: number) => {
    setSelectedSlots(selectedSlots.filter((_, i) => i !== index))
  }

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    const updated = [...selectedSlots]
    updated[index] = { ...updated[index], [field]: value }
    setSelectedSlots(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedSlots.length === 0) {
      toast(t("toast.atLeastOne"), { type: "error" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          inviteToken: participant.invite_token,
          slots: selectedSlots,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("toast.submitError"))
      }

      toast(t("toast.submitSuccess"))

      router.refresh()
    } catch (error) {
      toast(error instanceof Error ? error.message : t("toast.submitError"), {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSlotsForDate = (date: string) => {
    return selectedSlots.map((slot, index) => ({ ...slot, index })).filter((slot) => slot.date === date)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
        {event.description && <p className="text-muted-foreground max-w-2xl mx-auto">{event.description}</p>}
      </div>

      {/* Event Info */}
      <Card>
        <CardHeader>
          <CardTitle>{t("eventInfo")}</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("organizedBy")}</p>
              <p className="text-sm text-muted-foreground">{creator?.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">{t("dateRange")}</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date(event.start_date))} - {formatDate(new Date(event.end_date))}
              </p>
            </div>
          </div>
          {event.start_time && event.end_time && (
            <div className="flex items-start gap-3 col-span-full">
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">{t("preferredTime")}</p>
                <p className="text-sm text-muted-foreground">
                  {event.start_time} - {event.end_time}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Availability Submission */}
      {participant.has_submitted ? (
        <Card className="bg-accent/10 border-accent/30">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Check className="h-5 w-5 text-accent" />
              {t("submittedTitle")}
            </CardTitle>
            <CardDescription>{t("submittedDescription")}</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>{t("submitTitle")}</CardTitle>
            <CardDescription>{t("submitDescription")}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("selectTitle")}</CardTitle>
            <CardDescription>{t("selectDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {dateRange.map((date) => {
              const dateISO = formatDateISO(date)
              const slotsForDate = getSlotsForDate(dateISO)
              const hasSlots = slotsForDate.length > 0

              return (
                <div key={dateISO} className="space-y-3 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{formatDate(date)}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addTimeSlot(dateISO)}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("addTime")}
                    </Button>
                  </div>

                  {hasSlots && (
                    <div className="space-y-2 pt-4 border-t">
                      {slotsForDate.map((slot) => (
                        <div key={slot.index} className="flex items-center gap-2">
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateTimeSlot(slot.index, "startTime", e.target.value)}
                            className="px-3 py-2 rounded-md border border-input bg-background text-sm w-full"
                            required
                          />
                          <span className="text-muted-foreground">{t("to")}</span>
                          <input
                            type="time"
                            lang="pt"
                            value={slot.endTime}
                            onChange={(e) => updateTimeSlot(slot.index, "endTime", e.target.value)}
                            className="px-3 py-2 rounded-md border border-input bg-background text-sm w-full"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeTimeSlot(slot.index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t("submitting")}
            </>
          ) : participant.has_submitted ? (
            t("updateButton")
          ) : (
            t("submitButton")
          )}
        </Button>
      </form>
    </div>
  )
}
