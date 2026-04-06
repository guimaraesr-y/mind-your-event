import { ApiException } from "@/lib/exceptions/api";
import { IUserRepository } from "@/modules/user/interfaces/user-repository.interface";
import { IAvailabilityRepository } from "../interfaces/availability-repository.interface";
import { IParticipantRepository } from "@/modules/events/interfaces/participant-repository.interface";
import { IEventRepository } from "@/modules/events/interfaces/event-repository.interface";
import { eventBus, DomainEventType } from "@/lib/events";
import UserRepository from "@/modules/user/repository";
import AvailabilityRepository from "../repository";
import ParticipantRepository from "@/modules/events/participant-repository";
import EventRepository from "@/modules/events/repository";

export interface AvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
}

export interface AddUserAvailabilityDto {
    eventId: string;
    inviteToken: string;
    slots: AvailabilitySlot[];
}

export default class AddUserAvailabilityUseCase {

    constructor(
        private userRepository: IUserRepository = new UserRepository(),
        private availabilityRepository: IAvailabilityRepository = new AvailabilityRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private eventRepository: IEventRepository = new EventRepository()
    ) { }

    public async execute(payload: AddUserAvailabilityDto) {
        const user = await this.userRepository.getUserByInviteToken(payload.inviteToken);
        if (!user) {
            throw new ApiException("User not found", 404);
        }

        await this.availabilityRepository.deleteAvailabilities(payload.eventId, user.id);
        await this.availabilityRepository.insertAvailabilities(payload.eventId, user.id, payload.slots);
        await this.participantRepository.updateParticipantStatus(payload.eventId, user.id, true);

        const event = await this.eventRepository.getEventById(payload.eventId);
        if (event && event.creator_id !== user.id) {
            await eventBus.publish({
                type: DomainEventType.AVAILABILITY_SUBMITTED,
                payload: {
                    eventId: payload.eventId,
                    eventTitle: event.title,
                    participantId: user.id,
                    participantName: user.name,
                    organizerId: event.creator_id
                },
                timestamp: new Date()
            });
        }
    }

}
