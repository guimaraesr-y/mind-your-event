"use client"

import type React from "react"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, Loader2, Check, Shield, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface AvailabilityFormProps {
  event: any
  participant: any
  creator: any
  existingAvailability: any[]
  requiredEmail?: string
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
  requiredEmail,
}: AvailabilityFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>(
    existingAvailability.map((slot) => ({
      date: slot.date,
      startTime: slot.start_time,
      endTime: slot.end_time,
    })),
  )

  useEffect(() => {
    const sessionToken = localStorage.getItem("sessionToken")
    const userEmail = localStorage.getItem("userEmail")

    if (!sessionToken || !userEmail) {
      setIsAuthenticated(false)
      return
    }

    if (requiredEmail && userEmail !== requiredEmail) {
      setIsAuthenticated(false)
      toast(`Authentication required! Please verify your email ${requiredEmail} to continue`, {
        type: "error",
      })
      return
    }

    setIsAuthenticated(true)
  }, [requiredEmail])

  const handleVerifyEmail = () => {
    router.push("/verify?email=" + requiredEmail)
  }

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
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
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
      toast("Please add at least one time slot", { type: "error" })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          userId: participant.user_id,
          participantId: participant.id,
          slots: selectedSlots,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to submit availability")
      }

      toast("Thank you for submitting your availability!")

      router.refresh()
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to submit availability", {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSlotsForDate = (date: string) => {
    return selectedSlots.map((slot, index) => ({ ...slot, index })).filter((slot) => slot.date === date)
  }

  if (!isAuthenticated) {
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
          <CardTitle>Event Information</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">Organized by</p>
              <p className="text-sm text-muted-foreground">{creator?.name}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">Date Range</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(new Date(event.start_date))} - {formatDate(new Date(event.end_date))}
              </p>
            </div>
          </div>
          {event.start_time && event.end_time && (
            <div className="flex items-start gap-3 col-span-full">
              <Clock className="h-5 w-5 text-muted-foreground mt-1" />
              <div>
                <p className="text-sm font-medium text-foreground">Preferred Time Range</p>
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
              Availability Submitted
            </CardTitle>
            <CardDescription>You can update your availability below if needed.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle>Submit Your Availability</CardTitle>
            <CardDescription>Select the dates and times when you're available.</CardDescription>
          </CardHeader>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Available Times</CardTitle>
            <CardDescription>Click on a date to add your availability for that day.</CardDescription>
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
                      Add Time
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
                          <span className="text-muted-foreground">to</span>
                          <input
                            type="time"
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
              Submitting...
            </>
          ) : participant.has_submitted ? (
            "Update Availability"
          ) : (
            "Submit Availability"
          )}
        </Button>
      </form>
    </div>
  )
}
