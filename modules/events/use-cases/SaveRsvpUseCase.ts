import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import { IEventRepository } from "../interfaces/event-repository.interface";
import ParticipantRepository from "../participant-repository";
import EventRepository from "../repository";
import { ApiException } from "@/lib/exceptions/api";
import { eventBus, DomainEventType } from "@/lib/events";

interface SaveRsvpDto {
    eventId: string;
    inviteToken: string;
    willAttend: boolean;
}

export default class SaveRsvpUseCase {

    constructor(
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private eventRepository: IEventRepository = new EventRepository()
    ) { }

    public async execute(payload: SaveRsvpDto) {
        try {
            const participant = await this.participantRepository.getParticipantByInviteToken(payload.inviteToken);
            
            await this.participantRepository.updateRsvp(payload.eventId, payload.inviteToken, payload.willAttend);

            if (participant) {
                const event = await this.eventRepository.getEventById(payload.eventId);
                if (event) {
                    await eventBus.publish({
                        type: DomainEventType.RSVP_SUBMITTED,
                        payload: {
                            eventId: payload.eventId,
                            eventTitle: event.title,
                            participantId: participant.user_id,
                            participantName: participant.user.name,
                            organizerId: event.creator_id,
                            willAttend: payload.willAttend
                        },
                        timestamp: new Date()
                    });
                }
            }
        } catch (error) {
            if (error instanceof ApiException) {
                throw error;
            }
            if (error instanceof Error) {
                throw new ApiException(error.message, 500);
            }
            throw new ApiException("Failed to update RSVP", 500);
        }
    }

}
