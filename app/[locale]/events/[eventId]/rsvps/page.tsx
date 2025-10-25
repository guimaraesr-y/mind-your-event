import { notFound } from "next/navigation"
import { getCurrentUser } from "@/actions/user/get-current-user"
import { retrieveEventById, retrieveEventParticipants } from "@/actions/event/retrieve"
import { RsvpDashboard } from "@/components/rsvp-dashboard"
import { Header } from "@/components/header"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function RsvpsPage({ params }: PageProps) {
  const { eventId } = await params
  const user = await getCurrentUser();
  const event = await retrieveEventById(eventId);

  if (!user || !event || event?.creator_id !== user.id) {
    notFound();
  }

  if (!event.is_finalized) {
    // Redirect back to the event dashboard if the event is not finalized
    // You might want to show a message instead
    notFound();
  }

  const participants = await retrieveEventParticipants(eventId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <RsvpDashboard event={event} participants={participants || []} />
      </main>
    </div>
  )
}
