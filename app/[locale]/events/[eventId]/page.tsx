import { notFound, redirect } from "next/navigation";
import { EventDashboard } from "@/components/event-dashboard";
import { retrieveEventById, retrieveEventParticipants } from "@/actions/event/retrieve";
import { getCurrentUser } from "@/actions/user/get-current-user";
import { Header } from "@/components/header";

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
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <EventDashboard event={event} participants={participants || []} />
      </main>
    </div>
  );
}
