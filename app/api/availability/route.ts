import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, userId, participantId, slots } = body

    if (!eventId || !userId || !participantId || !slots || slots.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Delete existing availability slots for this user and event
    const { error: deleteError } = await supabase
      .from("availability_slots")
      .delete()
      .eq("event_id", eventId)
      .eq("user_id", userId)

    if (deleteError) {
      console.error("[v0] Error deleting existing slots:", deleteError)
      return NextResponse.json({ error: "Failed to update availability" }, { status: 500 })
    }

    // Insert new availability slots
    const slotsToInsert = slots.map((slot: any) => ({
      event_id: eventId,
      user_id: userId,
      date: slot.date,
      start_time: slot.startTime,
      end_time: slot.endTime,
    }))

    const { error: insertError } = await supabase.from("availability_slots").insert(slotsToInsert)

    if (insertError) {
      console.error("[v0] Error inserting slots:", insertError)
      return NextResponse.json({ error: "Failed to save availability" }, { status: 500 })
    }

    // Update participant status
    const { error: updateError } = await supabase
      .from("event_participants")
      .update({ has_submitted: true })
      .eq("id", participantId)

    if (updateError) {
      console.error("[v0] Error updating participant:", updateError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
