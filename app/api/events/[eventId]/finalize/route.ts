import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import FinalizeEventUseCase from "@/modules/events/use-cases/finalizeEventUseCase";
import { ApiException } from "@/lib/exceptions/api";
import { isEventOwner } from "@/actions/event/retrieve";
import { notFound } from "next/navigation";

export async function POST(request: NextRequest, { params }: { params: Promise<{ eventId: string }> }) {
  try {
    const c = await cookies();
    const sessionToken = c.get("session_token")?.value;
    const currentUser = await retrieveUserBySessionToken(sessionToken);

    const { eventId } = await params;

    if (!isEventOwner(currentUser?.id, eventId)) {
      return notFound();
    }

    const body = await request.json()
    const { finalizedDate, finalizedStartTime, finalizedEndTime } = body

    if (!finalizedDate || !finalizedStartTime || !finalizedEndTime) {
      throw new ApiException("Missing required fields", 400)
    }

    const finalizeEventUseCase = new FinalizeEventUseCase()
    const event = await finalizeEventUseCase.execute({
      eventId,
      finalizedDate,
      finalizedStartTime,
      finalizedEndTime
    })

    return NextResponse.json({ success: true, event })
  } catch (error) {
    if (error instanceof ApiException) {
      return NextResponse.json({ error: error.message }, { status: error.httpCode })
    }

    console.error("[v0] Error in POST /api/events/[eventId]/finalize:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
