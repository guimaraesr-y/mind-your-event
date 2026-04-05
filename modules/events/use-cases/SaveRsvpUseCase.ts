import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import ParticipantRepository from "../participant-repository";
import { ApiException } from "@/lib/exceptions/api";

interface SaveRsvpDto {
    eventId: string;
    inviteToken: string;
    willAttend: boolean;
}

export default class SaveRsvpUseCase {

    constructor(
        private participantRepository: IParticipantRepository = new ParticipantRepository()
    ) { }

    public async execute(payload: SaveRsvpDto) {
        try {
            await this.participantRepository.updateRsvp(payload.eventId, payload.inviteToken, payload.willAttend);
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
