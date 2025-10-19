import { type NextRequest, NextResponse } from "next/server"
import { ApiException } from "@/lib/exceptions/api"
import SaveRsvpUseCase from "@/modules/events/use-cases/SaveRsvpUseCase"

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const { eventId } = await params;

    const body = await request.json()
    const { inviteToken, willAttend } = body

    if (!inviteToken || typeof willAttend !== "boolean") {
      throw new ApiException("Missing required fields", 400);
    }

    const saveRsvpUseCase = new SaveRsvpUseCase()
    await saveRsvpUseCase.execute({ eventId, inviteToken, willAttend })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiException) {
      return NextResponse.json({ error: error.message }, { status: error.httpCode })
    }

    console.error("[v0] Error in POST /api/events/[eventId]/rsvp:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
