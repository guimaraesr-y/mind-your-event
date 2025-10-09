import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params
    const body = await request.json()
    const { participantId, willAttend } = body

    if (!participantId || typeof willAttend !== "boolean") {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Update participant RSVP status
    const { error: updateError } = await supabase
      .from("event_participants")
      .update({ will_attend: willAttend })
      .eq("id", participantId)
      .eq("event_id", eventId)

    if (updateError) {
      console.error("[v0] Error updating RSVP:", updateError)
      return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/events/[eventId]/rsvp:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
