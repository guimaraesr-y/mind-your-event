import { notFound } from "next/navigation"
import { ResultsDashboard } from "@/components/results-dashboard"
import { getCurrentUser } from "@/actions/user/get-current-user"
import { retrieveEventAvailabilities, retrieveEventById, retrieveEventParticipants } from "@/actions/event/retrieve"
import { Header } from "@/components/header"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { eventId } = await params
  const user = await getCurrentUser();
  const event = await retrieveEventById(eventId);

  if (!user || !event || event?.creator_id !== user.id) {
    notFound();
  }

  const participants = await retrieveEventParticipants(eventId);
  const availabilitySlots = await retrieveEventAvailabilities(eventId);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-4 py-8 md:py-12">
        <ResultsDashboard event={event} participants={participants || []} availabilitySlots={availabilitySlots || []} />
      </main>
    </div>
  )
}
