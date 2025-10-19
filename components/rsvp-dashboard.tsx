"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Clock, User, Users, ArrowLeft, Calendar } from "lucide-react"
import Link from "next/link"
import { useMemo } from "react"

interface RsvpDashboardProps {
  event: any
  participants: any[]
}

export function RsvpDashboard({ event, participants }: RsvpDashboardProps) {
  const totalParticipants = participants.length

  const attending = useMemo(() => participants.filter(p => p.will_attend === true), [participants])
  const notAttending = useMemo(() => participants.filter(p => p.will_attend === false), [participants])
  const pending = useMemo(() => participants.filter(p => p.will_attend === null), [participants])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/events/${event.id}`}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Event Dashboard
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title} - RSVPs</h1>
          <p className="text-muted-foreground">See who is attending your event.</p>
        </div>
      </div>

      {/* Finalized Details */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle>Final Event Details</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">Date</p>
              <p className="text-lg font-semibold text-foreground">{formatDate(event.finalized_date)}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-primary mt-1" />
            <div>
              <p className="text-sm font-medium text-foreground">Time</p>
              <p className="text-lg font-semibold text-foreground">
                {formatTime(event.finalized_start_time)} - {formatTime(event.finalized_end_time)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Attending</CardTitle>
            <Check className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{attending.length} / {totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Not Attending</CardTitle>
            <X className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{notAttending.length} / {totalParticipants}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pending.length} / {totalParticipants}</div>
          </CardContent>
        </Card>
      </div>

      {/* Participant Lists */}
      <div className="grid md:grid-cols-1 gap-6">
        <ParticipantList title="Attending" participants={attending} icon={Check} iconClass="text-accent" />
        <ParticipantList title="Not Attending" participants={notAttending} icon={X} iconClass="text-destructive" />
        <ParticipantList title="Pending" participants={pending} icon={Clock} iconClass="text-muted-foreground" />
      </div>
    </div>
  )
}

function ParticipantList({ title, participants, icon: Icon, iconClass }: { title: string, participants: any[], icon: React.ElementType, iconClass: string }) {
  if (participants.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`h-5 w-5 ${iconClass}`} />
          {title} ({participants.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-background"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{participant.users.name}</p>
                <p className="text-xs text-muted-foreground truncate">{participant.users.email}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
