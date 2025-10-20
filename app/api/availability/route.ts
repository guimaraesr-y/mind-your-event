import { type NextRequest, NextResponse } from "next/server"
import { ApiException } from "@/lib/exceptions/api"
import AddUserAvailabilityUseCase from "@/modules/availability/use-cases/addUserAvailabilityUseCase"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, inviteToken, slots } = body

    if (!eventId || !inviteToken || !slots || slots.length === 0) {
      throw new ApiException("Missing required fields", 400)
    }

    const addUserAvailabilityUseCase = new AddUserAvailabilityUseCase()
    await addUserAvailabilityUseCase.execute({
      eventId,
      inviteToken,
      slots,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiException) {
      return NextResponse.json({ error: error.message }, { status: error.httpCode })
    }
    console.error("[v0] Error in POST /api/availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
