'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { EventParticipantWithEvent, retrieveEventsByCreatorId, retrieveParticipatingEventsByUserId } from "@/actions/event/retrieve";
import { useEffect, useState } from "react";
import { CreatedEvents } from "@/components/created-events";
import { ParticipatingEvents } from "@/components/participating-events";
import { EventInterface } from "@/modules/events/event";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

export default function DashboardPage() {
  const t = useTranslations("DashboardPage");
  const { user, isLoading } = useAuth();
  const [pendingCreatedEvents, setPendingCreatedEvents] = useState<EventInterface[]>([]);
  const [finalizedCreatedEvents, setFinalizedCreatedEvents] = useState<EventInterface[]>([]);
  const [pendingParticipatingEvents, setPendingParticipatingEvents] = useState<EventParticipantWithEvent[]>([]);
  const [finalizedParticipatingEvents, setFinalizedParticipatingEvents] = useState<EventParticipantWithEvent[]>([]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    (async () => {
      const [created, participating] = await Promise.all([
        retrieveEventsByCreatorId(user!.id),
        retrieveParticipatingEventsByUserId(user!.id),
      ]);

      setPendingCreatedEvents(created.filter(e => !e.is_finalized));
      setFinalizedCreatedEvents(created.filter(e => e.is_finalized));
      
      setPendingParticipatingEvents(participating.filter(e => !e.events.is_finalized));
      setFinalizedParticipatingEvents(participating.filter(e => e.events.is_finalized));
    })();

    return () => {
      setPendingCreatedEvents([]);
      setFinalizedCreatedEvents([]);
      setPendingParticipatingEvents([]);
      setFinalizedParticipatingEvents([]);
    }
  }, [isLoading, user])

  const eventHasAvailability = (participant: EventParticipantWithEvent): boolean => {
    const event = participant.events;
    return Boolean(event?.availability_slots.length > 0)
  }

  const participantWillAtted = (participant: EventParticipantWithEvent): boolean => {
    return Boolean(participant.will_attend)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <Calendar className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">
                MindYourEvent
              </h1>
            </Link>
            <Button asChild>
              <Link href="/create">{t("createEvent")}</Link>
            </Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                {t("title")}
              </h1>
              <p className="text-muted-foreground">
                {t("description")}
              </p>
            </div>

            <div className="space-y-12">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">{t("pendingEvents.title")}</h2>
                <div className="space-y-6">
                  <CreatedEvents 
                    title={t("pendingEvents.createdEvents.title")}
                    description={t("pendingEvents.createdEvents.description")}
                    events={pendingCreatedEvents} 
                  />
                  <ParticipatingEvents 
                    title={t("pendingEvents.invitedToEvents.title")}
                    description={t("pendingEvents.invitedToEvents.description")}
                    events={pendingParticipatingEvents}
                    participationConfirmMethod={eventHasAvailability}
                  />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">{t("finalizedEvents.title")}</h2>
                <div className="space-y-6">
                  <CreatedEvents 
                    title={t("finalizedEvents.createdEvents.title")}
                    description={t("finalizedEvents.createdEvents.description")}
                    events={finalizedCreatedEvents}
                  />
                  <ParticipatingEvents 
                    title={t("finalizedEvents.invitedToEvents.title")}
                    description={t("finalizedEvents.invitedToEvents.description")}
                    events={finalizedParticipatingEvents}
                    participationConfirmMethod={participantWillAtted}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
