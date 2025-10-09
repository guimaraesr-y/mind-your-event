"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Users, TrendingUp, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"
import { AvailabilityHeatmap } from "@/components/availability-heatmap"
import { ParticipantsList } from "@/components/participants-list"
import { FinalizeEventDialog } from "@/components/finalize-event-dialog"

interface ResultsDashboardProps {
  event: any
  participants: any[]
  availabilitySlots: any[]
}

interface TimeSlotOverlap {
  date: string
  startTime: string
  endTime: string
  count: number
  percentage: number
  participants: string[]
}

export function ResultsDashboard({ event, participants, availabilitySlots }: ResultsDashboardProps) {
  const totalParticipants = participants.length
  const submittedCount = participants.filter((p) => p.has_submitted).length

  // Calculate overlapping time slots
  const overlaps = useMemo(() => {
    const overlapMap = new Map<string, TimeSlotOverlap>()

    availabilitySlots.forEach((slot) => {
      const key = `${slot.date}-${slot.start_time}-${slot.end_time}`
      const existing = overlapMap.get(key)

      if (existing) {
        existing.count++
        existing.participants.push(slot.users.name)
        existing.percentage = (existing.count / totalParticipants) * 100
      } else {
        overlapMap.set(key, {
          date: slot.date,
          startTime: slot.start_time,
          endTime: slot.end_time,
          count: 1,
          percentage: (1 / totalParticipants) * 100,
          participants: [slot.users.name],
        })
      }
    })

    return Array.from(overlapMap.values()).sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count
      if (a.date !== b.date) return a.date.localeCompare(b.date)
      return a.startTime.localeCompare(b.startTime)
    })
  }, [availabilitySlots, totalParticipants])

  const bestSlots = overlaps.slice(0, 5)
  const bestSlot = bestSlots[0]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={`/events/${event.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Event
              </Link>
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">{event.title} - Results</h1>
          <p className="text-muted-foreground">Availability analysis and optimal time slots</p>
        </div>
      </div>

      {!event.is_finalized && bestSlot && (
        <FinalizeEventDialog
          eventId={event.id}
          suggestedDate={bestSlot.date}
          suggestedStartTime={bestSlot.startTime}
          suggestedEndTime={bestSlot.endTime}
        />
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold text-foreground">{totalParticipants}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-accent" />
              <span className="text-2xl font-bold text-foreground">
                {submittedCount} / {totalParticipants}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round((submittedCount / totalParticipants) * 100)}% response rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Slots</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-chart-3" />
              <span className="text-2xl font-bold text-foreground">{availabilitySlots.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Total availability slots submitted</p>
          </CardContent>
        </Card>
      </div>

      {/* Best Time Slots */}
      {bestSlots.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Best Time Slots</CardTitle>
            <CardDescription>Times when the most participants are available</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {bestSlots.map((slot, index) => (
                <div
                  key={`${slot.date}-${slot.startTime}-${slot.endTime}`}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                      className={`flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0 ${
                        index === 0
                          ? "bg-primary text-primary-foreground"
                          : index === 1
                            ? "bg-accent text-accent-foreground"
                            : "bg-muted-foreground/20 text-foreground"
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
                    <p className="text-xs text-muted-foreground">{Math.round(slot.percentage)}% available</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Availability Heatmap */}
      <AvailabilityHeatmap event={event} availabilitySlots={availabilitySlots} totalParticipants={totalParticipants} />

      {/* Participants List */}
      <ParticipantsList participants={participants} availabilitySlots={availabilitySlots} />

      {submittedCount < totalParticipants && (
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground text-center">
              Waiting for {totalParticipants - submittedCount} more{" "}
              {totalParticipants - submittedCount === 1 ? "participant" : "participants"} to submit availability
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
