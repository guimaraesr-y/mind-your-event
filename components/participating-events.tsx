"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Users, Clock, CircleCheck } from "lucide-react";
import Link from "next/link";
import { EventParticipantWithEvent } from "@/actions/event/retrieve";

interface ParticipatingEventsProps {
  events: any[];
  title: string;
  description: string;
  participationConfirmMethod: (participation: EventParticipantWithEvent) => boolean;
}

export function ParticipatingEvents({ events, title, description, participationConfirmMethod }: ParticipatingEventsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
              <div
                key={p.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="space-y-1">
                  <p className="font-semibold text-foreground inline-flex items-center justify-center gap-2">
                    {participationConfirmMethod(p) ? (
                      <CircleCheck className="text-accent/50" />
                    ) : (
                      <Clock className="text-primary/50" />
                    )}
                    {p.events.title}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {formatDate(p.events.start_date)} -{" "}
                        {formatDate(p.events.end_date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4" />
                      <span>
                        Organized by {p.events.users.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span>{p.events.event_participants[0].count} participants</span>
                    </div>
                  </div>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/invite/${p.invite_token}`}>
                    View Invitation
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
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
