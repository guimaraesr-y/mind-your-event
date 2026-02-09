import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import UpdateEventUseCase from "@/modules/events/use-cases/updateEventUseCase";
import { ApiException } from "@/lib/exceptions/api";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ eventId: string }> }
) {
    try {
        const { eventId } = await params;
        const c = await cookies();
        const sessionToken = c.get("session_token")?.value;
        const currentUser = await retrieveUserBySessionToken(sessionToken);

        if (!currentUser) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const {
            title,
            description,
            startDate,
            endDate,
            startTime,
            endTime,
        } = body;

        const updateEventUseCase = new UpdateEventUseCase();
        const event = await updateEventUseCase.execute(eventId, currentUser.id, {
            title,
            description,
            start_date: startDate,
            end_date: endDate,
            start_time: startTime,
            end_time: endTime,
        });

        return NextResponse.json({ event, success: true });
    } catch (error) {
        if (error instanceof ApiException) {
            return NextResponse.json({ error: error.message }, { status: error.httpCode });
        }
        console.error(`[v0] Error in PATCH /api/events/[eventId]:`, error);
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
