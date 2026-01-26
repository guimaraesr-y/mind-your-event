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

import { useTranslations } from "next-intl";

interface ParticipatingEventsProps {
  events: any[];
  title: string;
  description: string;
  participationConfirmMethod: (participation: EventParticipantWithEvent) => boolean;
}

export function ParticipatingEvents({ events, title, description, participationConfirmMethod }: ParticipatingEventsProps) {
  const t = useTranslations("ParticipatingEvents");

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4 text-left">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((p) => (
              <EventCard
                key={p.id}
                title={p.event.title}
                startDate={p.event.start_date}
                endDate={p.event.end_date}
                participantsCount={p.event._count.participants}
                organizerName={p.event.creator.name}
                statusIcon={
                  participationConfirmMethod(p) ? (
                    <CircleCheck className="h-5 w-5 text-accent" />
                  ) : (
                    <Clock className="h-5 w-5 text-primary" />
                  )
                }
                linkHref={`/invite/${p.invite_token}`}
                linkTextKey="viewInvitation"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border-2 border-dashed bg-muted/30">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Clock className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium text-center max-w-[250px]">
              {t("noInvitations")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
