import { EventInterface } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { SendEventFinalizedEmailUseCase } from "./email/sendEventFinalizedEmail";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";
import { emailRetryService } from "@/lib/email/email-retry.service";

interface FinalizeEventDto {
    eventId: string;
    finalizedDate: string;
    finalizedStartTime: string;
    finalizedEndTime: string;
}

interface EmailPayload {
    email: string;
    userName: string;
    eventTitle: string;
    eventLink: string;
    finalizedDate: string;
    finalizedTime: string;
}

export default class FinalizeEventUseCase {

    constructor(
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private sendEventFinalizedEmail: SendEventFinalizedEmailUseCase = new SendEventFinalizedEmailUseCase()
    ) { }

    private async sendEmailWithRetry(payload: EmailPayload): Promise<void> {
        await emailRetryService.executeWithRetry(() =>
            this.sendEventFinalizedEmail.execute(payload)
        );
    }

    private async updateFinalizedEvent(
        eventId: string,
        finalizedDate: string,
        finalizedStartTime: string,
        finalizedEndTime: string,
    ): Promise<EventInterface> {
        return await this.eventRepository.updateEvent(eventId, {
            is_finalized: true,
            finalized_date: finalizedDate,
            finalized_start_time: finalizedStartTime,
            finalized_end_time: finalizedEndTime,
            updated_at: new Date().toISOString(),
        });
    }

    private async isEventFinalized(eventId: string): Promise<boolean> {
        return await this.eventRepository.isEventConfirmed(eventId);
    }

    private async notificateParticipants(event: EventInterface) {
        const participants = await this.participantRepository.getParticipantsByEventId(event.id);

        if (!participants) {
            return;
        }

        for (const participant of participants) {
            const email = participant.user.email;
            const finalizedTime = `${event.finalized_start_time} - ${event.finalized_end_time}`;

            try {
                await this.sendEmailWithRetry({
                    email,
                    userName: participant.user.name,
                    eventTitle: event.title,
                    eventLink: this.getParticipantUrl(participant.invite_token),
                    finalizedDate: event.finalized_date,
                    finalizedTime,
                });
            } catch (error) {
                console.error(`Failed to send finalization email to ${email}:`, error);
            }
        }
    }

    public async execute(payload: FinalizeEventDto) {
        if (await this.isEventFinalized(payload.eventId)) {
            throw new ApiException("Event is already finalized", 400);
        }

        const event = await this.updateFinalizedEvent(
            payload.eventId,
            payload.finalizedDate,
            payload.finalizedStartTime,
            payload.finalizedEndTime
        )

        await this.notificateParticipants(event);
        return event;
    }

    private getParticipantUrl(token: string) {
        const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
        return `${baseUrl}/invite/${token}`;
    }

}
