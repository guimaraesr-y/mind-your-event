"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, User, LinkIcon, Copy, Check, BarChart3 } from "lucide-react"
import { useState } from "react"
import { toast } from "react-toastify"
import Link from "next/link"

interface EventDashboardProps {
  event: any
  participants: any[]
}

export function EventDashboard({ event, participants }: EventDashboardProps) {
  const [copiedTokens, setCopiedTokens] = useState<Set<string>>(new Set())

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`
    navigator.clipboard.writeText(link)
    setCopiedTokens(new Set(copiedTokens).add(token))
    toast("Link copied!")
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
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const submittedCount = participants.filter((p) => p.has_submitted).length

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Event Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
        {event.description && <p className="text-muted-foreground">{event.description}</p>}
      </div>

      {/* View Results Button */}
      {submittedCount > 0 && (
        <Button asChild size="lg" className="w-full">
          <Link href={`/events/${event.id}/results`}>
            <BarChart3 className="mr-2 h-5 w-5" />
            View Results & Availability
          </Link>
        </Button>
      )}

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Organizer</p>
              <p className="text-sm text-muted-foreground">
                {event.users.name} ({event.users.email})
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Date Range</p>
              <p className="text-sm text-muted-foreground">
                {formatDate(event.start_date)} - {formatDate(event.end_date)}
              </p>
            </div>
          </div>

          {event.start_time && event.end_time && (
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
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

      {/* Participants */}
      <Card>
        <CardHeader>
          <CardTitle>
            Participants ({submittedCount}/{participants.length})
          </CardTitle>
          <CardDescription>Share these unique links with each participant</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{participant.users.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{participant.users.email}</p>
                  </div>
                  {participant.has_submitted && (
                    <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full flex-shrink-0">
                      Submitted
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyInviteLink(participant.invite_token)}
                  className="ml-2 flex-shrink-0"
                >
                  {copiedTokens.has(participant.invite_token) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
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
            <LinkIcon className="h-5 w-5" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-foreground">
          <p>1. Copy and share the invite links with each participant</p>
          <p>2. Participants will submit their available times</p>
          <p>3. View results to see availability overlaps and find the best time</p>
        </CardContent>
      </Card>
    </div>
  )
}
