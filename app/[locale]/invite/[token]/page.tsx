import { notFound } from "next/navigation"
import { AvailabilityForm } from "@/components/availability-form"
import { RsvpCard } from "@/components/rsvp-card"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/actions/user/get-current-user"
import { retrieveEventCreator, retrieveEventParticipantByInviteToken, retrieveUserAvailabilitiesForEvent } from "@/actions/event/retrieve"
import { EmailVerificationRequiredCard } from "@/components/email-verification-card"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) { // TODO: remove auth. this route should be accessible through the invite link without auth
  const { token } = await params
  const user = await getCurrentUser();
  const participant = await retrieveEventParticipantByInviteToken(token);

  if (!user || participant.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmailVerificationRequiredCard
          requiredEmail={participant.users.email}
        />
      </div>
    )
  }

  if (!participant) {
    notFound();
  }

  const creator = await retrieveEventCreator(participant.event_id)
  const existingAvailability = await retrieveUserAvailabilitiesForEvent(
    user.id,
    participant.event_id,
  );

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
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">MindYourEvent</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        {isFinalized ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>Event Finalized</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
              {event.description && <p className="text-muted-foreground max-w-2xl mx-auto">{event.description}</p>}
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

            <RsvpCard
              eventId={event.id}
              inviteToken={token}
              currentRsvp={participant.will_attend}
            />
          </div>
        ) : (
          <AvailabilityForm
            event={event}
            participant={participant}
            creator={creator}
            existingAvailability={existingAvailability || []}
          />
        )}
      </main>
    </div>
  )
}
