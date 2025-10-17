"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowRight, Users } from "lucide-react";
import Link from "next/link";

interface ParticipatingEventsProps {
  events: any[];
}

export function ParticipatingEvents({ events }: ParticipatingEventsProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Events You Are Participating In</CardTitle>
        <CardDescription>
          Events you have been invited to.
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
                  <p className="font-semibold text-foreground">
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
              You haven't been invited to any events yet.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
