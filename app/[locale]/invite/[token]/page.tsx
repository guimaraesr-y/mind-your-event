import { notFound, redirect } from "next/navigation"
import { AvailabilityForm } from "@/components/availability-form"
import { RsvpCard } from "@/components/rsvp-card"
import { Calendar, CheckCircle2, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/actions/user/get-current-user"
import { retrieveEventByPublicToken, retrieveEventCreator, retrieveEventParticipantByInviteToken, retrieveUserAvailabilitiesForEvent } from "@/actions/event/retrieve"
import { EmailVerificationRequiredCard } from "@/components/email-verification-card"
import { getLocale, getTranslations } from "next-intl/server"
import { Header } from "@/components/header"
import { JoinEventForm } from "@/components/join-event-form"
import JoinEventUseCase from "@/modules/events/use-cases/JoinEventUseCase"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: PageProps) {
  const { token } = await params;
  const t = await getTranslations("InvitePage");
  const locale = await getLocale();
  const user = await getCurrentUser();

  // Try to find as a specific participant first
  const participant = await retrieveEventParticipantByInviteToken(token);
  const event = participant?.events;
  const creator = participant ? await retrieveEventCreator(participant.event_id) : null;

  // If not a participant token, maybe it's a public event token
  if (!participant) {
    const publicEvent = await retrieveEventByPublicToken(token);
    if (!publicEvent) {
      notFound();
    }

    // If user is logged in, join them automatically or redirect if already joined
    if (user) {
      const useCase = new JoinEventUseCase();
      const result = await useCase.execute({
        token,
        email: user.email,
        name: user.name,
        authenticatedUser: user
      });

      redirect(`/${locale}/invite/${result.invite_token}`);
    }

    // If it's a public event and user is NOT logged in, they need to join first
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 px-4 py-8 md:py-12 flex items-center justify-center">
          <JoinEventForm token={token} currentUser={user} />
        </main>
      </div>
    );
  }

  // If we reach here, we have a participant
  if (!event) {
    notFound();
  }

  // If there's a user logged in, match it. If not, we allow viewing via token.
  // We only block if there's a user logged in but it's NOT the participant's user.
  if (user && participant.user_id !== user.id) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <EmailVerificationRequiredCard
          requiredEmail={participant.users.email}
        />
      </div>
    )
  }

  const existingAvailability = await retrieveUserAvailabilitiesForEvent(
    participant.user_id,
    participant.event_id,
  );

  const isFinalized = event.is_finalized

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        {isFinalized ? (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                <CheckCircle2 className="h-4 w-4" />
                <span>{t("finalized.banner")}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">{event.title}</h1>
              {event.description && <p className="text-muted-foreground max-w-2xl mx-auto">{event.description}</p>}
            </div>

            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle>{t("finalized.cardTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("finalized.dateLabel")}</p>
                    <p className="text-lg font-semibold text-foreground">{formatDate(event.finalized_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{t("finalized.timeLabel")}</p>
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
