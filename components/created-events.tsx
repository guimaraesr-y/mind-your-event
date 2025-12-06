"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EventCard } from "./event-card";

interface CreatedEventsProps {
  events: any[];
  title: string;
  description: string;
}

export function CreatedEvents({ events, title, description }: CreatedEventsProps) {
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
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                startDate={event.start_date}
                endDate={event.end_date}
                participantsCount={event.event_participants[0].count}
                linkHref={`/events/${event.id}`}
                linkText="View Details"
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
