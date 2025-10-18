import { type NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { retrieveUserBySessionToken } from "@/actions/user/retrieve";
import CreateEventUseCase from "@/modules/events/use-cases/createEventUseCase";

export async function POST(request: NextRequest) {
  try {
    const c = await cookies();
    const sessionToken = c.get("session_token")?.value;
    const currentUser = await retrieveUserBySessionToken(sessionToken);

    const body = await request.json();
    const {
      title,
      description,
      startDate,
      endDate,
      startTime,
      endTime,
      participantEmails
    } = body;

    if (!title || !startDate || !endDate || !participantEmails) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!currentUser && (!body.creatorEmail || !body.creatorName)) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const creatorEmail = currentUser?.email || body.creatorEmail;
    const creatorName = currentUser?.name || body.creatorName;

    const emails = participantEmails
      .split(",")
      .map((email: string) => email.trim())
      .filter((email: string) => email.length > 0);

    if (emails.length === 0) {
      return NextResponse.json({ error: "At least one participant email is required" }, { status: 400 });
    }

    const createEventUseCase = new CreateEventUseCase();
    const event = await createEventUseCase.execute({
      title,
      description: description || null,
      start_date: startDate,
      end_date: endDate,
      start_time: startTime || null,
      end_time: endTime || null,
      participantEmails: emails,
      creatorEmail,
      creatorName,
    });

    return NextResponse.json({ eventId: event.id, success: true });
  } catch (error) {
    console.error("[v0] Error in POST /api/events:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
