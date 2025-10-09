import { getSupabaseServerClient } from "@/lib/server"
import { notFound } from "next/navigation"
import { ResultsDashboard } from "@/components/results-dashboard"
import { Calendar } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function ResultsPage({ params }: PageProps) {
  const { eventId } = await params
  const supabase = await getSupabaseServerClient()

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("*, users!events_creator_id_fkey(name, email)")
    .eq("id", eventId)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Fetch participants
  const { data: participants, error: participantsError } = await supabase
    .from("event_participants")
    .select("*, users(name, email)")
    .eq("event_id", eventId)

  if (participantsError) {
    console.error("[v0] Error fetching participants:", participantsError)
  }

  // Fetch all availability slots
  const { data: availabilitySlots, error: slotsError } = await supabase
    .from("availability_slots")
    .select("*, users(name, email)")
    .eq("event_id", eventId)

  if (slotsError) {
    console.error("[v0] Error fetching availability:", slotsError)
  }

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
        <ResultsDashboard event={event} participants={participants || []} availabilitySlots={availabilitySlots || []} />
      </main>
    </div>
  )
}
