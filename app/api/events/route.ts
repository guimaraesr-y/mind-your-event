import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, creatorName, creatorEmail, startDate, endDate, startTime, endTime, participantEmails } =
      body

    // Validate required fields
    if (!title || !creatorName || !creatorEmail || !startDate || !endDate || !participantEmails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Parse participant emails
    const emails = participantEmails
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0)

    if (emails.length === 0) {
      return NextResponse.json({ error: "At least one participant email is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Create or get creator user
    let { data: creator, error: creatorError } = await supabase
      .from("users")
      .select("*")
      .eq("email", creatorEmail)
      .single()

    if (creatorError || !creator) {
      const { data: newCreator, error: insertError } = await supabase
        .from("users")
        .insert({ email: creatorEmail, name: creatorName })
        .select()
        .single()

      if (insertError) {
        console.error("[v0] Error creating creator:", insertError)
        return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
      }
      creator = newCreator
    }

    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        title,
        description: description || null,
        creator_id: creator.id,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime || null,
        end_time: endTime || null,
      })
      .select()
      .single()

    if (eventError || !event) {
      console.error("[v0] Error creating event:", eventError)
      return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
    }

    // Create or get participant users and event participants
    for (const email of emails) {
      let { data: user, error: userError } = await supabase.from("users").select("*").eq("email", email).single()

      if (userError || !user) {
        const { data: newUser, error: insertError } = await supabase
          .from("users")
          .insert({ email, name: email.split("@")[0] })
          .select()
          .single()

        if (insertError) {
          console.error("[v0] Error creating participant user:", insertError)
          continue
        }
        user = newUser
      }

      // Generate unique invite token
      const inviteToken = randomBytes(32).toString("hex")

      // Create event participant
      const { error: participantError } = await supabase.from("event_participants").insert({
        event_id: event.id,
        user_id: user.id,
        invite_token: inviteToken,
      })

      if (participantError) {
        console.error("[v0] Error creating event participant:", participantError)
      }
    }

    return NextResponse.json({ eventId: event.id, success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
