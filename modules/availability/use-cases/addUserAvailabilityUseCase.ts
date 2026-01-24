import { ApiException } from "@/lib/exceptions/api";
import { IUserRepository } from "@/modules/user/interfaces/user-repository.interface";
import { IAvailabilityRepository } from "../interfaces/availability-repository.interface";
import { IParticipantRepository } from "@/modules/events/interfaces/participant-repository.interface";
import UserRepository from "@/modules/user/repository";
import AvailabilityRepository from "../repository";
import ParticipantRepository from "@/modules/events/participant-repository";

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
        private participantRepository: IParticipantRepository = new ParticipantRepository()
    ) { }

    public async execute(payload: AddUserAvailabilityDto) {
        const user = await this.userRepository.getUserByInviteToken(payload.inviteToken);
        if (!user) {
            throw new ApiException("User not found", 404);
        }

        await this.availabilityRepository.deleteAvailabilities(payload.eventId, user.id);
        await this.availabilityRepository.insertAvailabilities(payload.eventId, user.id, payload.slots);
        await this.participantRepository.updateParticipantStatus(payload.eventId, user.id, true);
    }

}
