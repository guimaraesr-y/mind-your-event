"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { EventCard } from "./event-card";

import { useTranslations } from "next-intl";

interface CreatedEventsProps {
  events: any[];
  title: string;
  description: string;
}

export function CreatedEvents({ events, title, description }: CreatedEventsProps) {
  const t = useTranslations("CreatedEvents");

  return (
    <Card className="border-none shadow-none bg-transparent">
      <CardHeader className="px-0 pb-4">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <CardDescription className="text-sm">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-0">
        {events.length > 0 ? (
          <div className="grid gap-4">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                startDate={event.start_date}
                endDate={event.end_date}
                participantsCount={event._count.participants}
                linkHref={`/events/${event.id}`}
                linkTextKey="viewDetails"
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl border-2 border-dashed bg-muted/30">
            <div className="h-12 w-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-medium text-center max-w-[250px]">
              {events.length === 0 ? t("noEvents") : t("noEventsFilter")}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
