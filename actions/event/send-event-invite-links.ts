'use server';

import { SendEventInviteEmailUseCase } from "@/modules/events/use-cases/email/sendEventInviteEmail";
import { retrieveEventById, retrieveEventParticipants } from "./retrieve";
import { emailRetryService } from "@/lib/email/email-retry.service";

/**
 * Sends event unique invite links to all participants of an event.
 */
export async function sendEventInviteLinkEmails(eventId: string) {
    const usecase = new SendEventInviteEmailUseCase();
    const event = await retrieveEventById(eventId);
    if (!event) {
        return;
    }

    const participants = await retrieveEventParticipants(eventId);

    for (const participant of participants) {
        const inviteLink = process.env.API_BASE_URL + "/invite/" + participant.invite_token;

        await emailRetryService.executeWithRetry(() =>
            usecase.execute({
                authorName: event.creator.name || "Unknown",
                email: participant.users.email,
                eventDescription: event?.description || "No description provided",
                eventTitle: event?.title || "No title provided",
                inviteLink,
            })
        );
    }
}
