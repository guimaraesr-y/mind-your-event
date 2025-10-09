import { getSupabaseServerClient } from "@/lib/server"
import { notFound } from "next/navigation"
import { EventDashboard } from "@/components/event-dashboard"
import { Calendar } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ eventId: string }>
}

export default async function EventPage({ params }: PageProps) {
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

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold text-foreground">EventSync</h1>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        <EventDashboard event={event} participants={participants || []} />
      </main>
    </div>
  )
}
