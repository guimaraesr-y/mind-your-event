"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CircleCheck, Clock } from "lucide-react";
import { EventParticipantWithEvent } from "@/actions/event/retrieve";
import { EventCard } from "./event-card";

interface ParticipatingEventsProps {
  events: any[];
  title: string;
  description: string;
  participationConfirmMethod: (participation: EventParticipantWithEvent) => boolean;
}

export function ParticipatingEvents({ events, title, description, participationConfirmMethod }: ParticipatingEventsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {events.length > 0 ? (
          <div className="space-y-4">
            {events.map((p) => (
              <EventCard
                key={p.id}
                title={p.events.title}
                startDate={p.events.start_date}
                endDate={p.events.end_date}
                participantsCount={p.events.event_participants[0].count}
                organizerName={p.events.users.name}
                statusIcon={
                  participationConfirmMethod(p) ? (
                    <CircleCheck className="text-accent/50" />
                  ) : (
                    <Clock className="text-primary/50" />
                  )
                }
                linkHref={`/invite/${p.invite_token}`}
                linkText="View Invitation"
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No events to show in this category.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
