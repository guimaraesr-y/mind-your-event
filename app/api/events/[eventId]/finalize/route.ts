import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"
import { sendEventFinalizedEmail } from "@/lib/email"

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const { finalizedDate, finalizedStartTime, finalizedEndTime } = body

    if (!finalizedDate || !finalizedStartTime || !finalizedEndTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Update event with finalized details
    const { data: event, error: updateError } = await supabase
      .from("events")
      .update({
        is_finalized: true,
        finalized_date: finalizedDate,
        finalized_start_time: finalizedStartTime,
        finalized_end_time: finalizedEndTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select("*, users!events_creator_id_fkey(name, email)")
      .single()

    if (updateError || !event) {
      console.error("[v0] Error finalizing event:", updateError)
      return NextResponse.json({ error: "Failed to finalize event" }, { status: 500 })
    }

    // Get all participants to send notifications
    const { data: participants } = await supabase
      .from("event_participants")
      .select("*, users(name, email)")
      .eq("event_id", eventId)

    // Send notification emails to all participants
    if (participants) {
      for (const participant of participants) {
        await sendEventFinalizedEmail(
          participant.users.email,
          event.title,
          finalizedDate,
          `${finalizedStartTime} - ${finalizedEndTime}`,
        )
      }
    }

    return NextResponse.json({ success: true, event })
  } catch (error) {
    console.error("[v0] Error in POST /api/events/[eventId]/finalize:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
