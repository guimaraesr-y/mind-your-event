import { getSupabaseServerClient } from "@/lib/server"
import { notFound } from "next/navigation"
import { AvailabilityForm } from "@/components/availability-form"
import { RsvpCard } from "@/components/rsvp-card"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params
  const supabase = await getSupabaseServerClient()

  // Fetch participant and event details
  const { data: participant, error: participantError } = await supabase
    .from("event_participants")
    .select("*, events(*), users(name, email)")
    .eq("invite_token", token)
    .single()

  if (participantError || !participant) {
    notFound()
  }

  // Fetch creator info
  const { data: creator } = await supabase
    .from("users")
    .select("name, email")
    .eq("id", participant.events.creator_id)
    .single()

  // Fetch existing availability if already submitted
  const { data: existingAvailability } = await supabase
    .from("availability_slots")
    .select("*")
    .eq("event_id", participant.event_id)
    .eq("user_id", participant.user_id)

  const event = participant.events
  const isFinalized = event.is_finalized

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">EventSync</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        {isFinalized ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-accent" />
                <span className="text-sm font-medium text-accent">Event Finalized</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground">{event.title}</h1>
              {event.description && <p className="text-muted-foreground">{event.description}</p>}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>Final Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Date</p>
                    <p className="text-lg font-semibold text-foreground">{formatDate(event.finalized_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Time</p>
                    <p className="text-lg font-semibold text-foreground">
                      {event.finalized_start_time} - {event.finalized_end_time}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <RsvpCard eventId={event.id} participantId={participant.id} currentRsvp={participant.will_attend} />
          </div>
        ) : (
          <AvailabilityForm
            event={event}
            participant={participant}
            creator={creator}
            existingAvailability={existingAvailability || []}
            requiredEmail={participant.users.email}
          />
        )}
      </main>
    </div>
  )
}
