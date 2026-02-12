import { EventInterface } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { SendEventFinalizedEmailUseCase } from "./email/sendEventFinalizedEmail";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";

interface FinalizeEventDto {
    eventId: string;
    finalizedDate: string;
    finalizedStartTime: string;
    finalizedEndTime: string;
}

export default class FinalizeEventUseCase {

    constructor(
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private sendEventFinalizedEmail: SendEventFinalizedEmailUseCase = new SendEventFinalizedEmailUseCase()
    ) { }

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

        const emailPromises = participants.map(async (participant) => {
            const email = participant.user.email;
            const finalizedTime = `${event.finalized_start_time} - ${event.finalized_end_time}`;

            try {
                await this.sendEventFinalizedEmail.execute({
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
        });

        await Promise.all(emailPromises);
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
