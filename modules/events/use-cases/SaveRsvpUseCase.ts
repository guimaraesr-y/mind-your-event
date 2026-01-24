import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import ParticipantRepository from "../participant-repository";

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
        } catch (error: any) {
            throw new Error(error.message);
        }
    }

}
