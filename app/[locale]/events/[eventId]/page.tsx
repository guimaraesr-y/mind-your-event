import { notFound, redirect } from "next/navigation";
import { EventDashboard } from "@/components/event-dashboard";
import { Calendar } from "lucide-react";
import Link from "next/link";
import { retrieveEventById, retrieveEventParticipants } from "@/actions/event/retrieve";
import { getCurrentUser } from "@/actions/user/get-current-user";

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function EventPage({ params }: PageProps) {
  const { eventId } = await params;

  const user = await getCurrentUser();
  if (!user) {
    redirect("/verify");
  }

  const event = await retrieveEventById(eventId);
  if (!event) {
    notFound();
  }

  if (event.creator_id !== user.id) {
    notFound();
  }

  const participants = await retrieveEventParticipants(eventId);

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
        <EventDashboard event={event} participants={participants || []} />
      </main>
    </div>
  );
}
