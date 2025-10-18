'use client';

import { AuthGuard } from "@/components/auth-guard";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { retrieveEventsByCreatorId, retrieveParticipatingEventsByUserId } from "@/actions/event/retrieve";
import { useEffect, useState } from "react";
import { CreatedEvents } from "@/components/created-events";
import { ParticipatingEvents } from "@/components/participating-events";
import { EventInterface } from "@/modules/events/event";

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const [createdEvents, setCreatedEvents] = useState<EventInterface[]>([]);
  const [participatingEvents, setParticipatingEvents] = useState<EventInterface[]>([]);

  useEffect(() => {
    if (isLoading || !user) {
      return;
    }

    (async () => {
      const [created, participating] = await Promise.all([
        retrieveEventsByCreatorId(user!.id),
        retrieveParticipatingEventsByUserId(user!.id),
      ]);

      setCreatedEvents(created);
      setParticipatingEvents(participating);
    })();

    return () => {
      setCreatedEvents([]);
      setParticipatingEvents([]);
    }
  }, [isLoading, user])

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col bg-background">
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
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
          </div>
        </header>
        <main className="flex-1 px-4 py-8 md:py-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground">
                Dashboard
              </h1>
              <p className="text-muted-foreground">
                An overview of your created events and participations.
              </p>
            </div>
            <CreatedEvents events={createdEvents} />
            <ParticipatingEvents events={participatingEvents} />
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
