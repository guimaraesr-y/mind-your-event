import { randomBytes } from "crypto";
import { UpdateEventDto, EventInterface, updateEventSchema } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";
import FindOrCreateUserUseCase from "@/modules/user/usecases/findOrCreateUserUseCase";

export default class UpdateEventUseCase {

    constructor(
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private findOrCreateUserUseCase: FindOrCreateUserUseCase = new FindOrCreateUserUseCase(),
    ) { }

    private async createParticipant(eventId: string, email: string) {
        const { user } = await this.findOrCreateUserUseCase.execute(email, email.split("@")[0]);
        const inviteToken = randomBytes(32).toString("hex");
        await this.participantRepository.createParticipant(eventId, user.id, inviteToken);
    }

    public async execute(eventId: string, userId: string, eventData: UpdateEventDto): Promise<EventInterface> {
        const validatedData = updateEventSchema.parse(eventData);

        const isOwner = await this.eventRepository.isEventOwner(userId, eventId);
        if (!isOwner) {
            throw new ApiException("You are not authorized to edit this event.", 403);
        }

        const isConfirmed = await this.eventRepository.isEventConfirmed(eventId);
        if (isConfirmed) {
            throw new ApiException("This event has already been confirmed and cannot be edited.", 400);
        }

        const { participantEmails, ...rest } = validatedData;

        if (participantEmails) {
            const currentParticipants = await this.participantRepository.getParticipantsByEventId(eventId);
            const currentEmails = currentParticipants.map(p => p.user.email);

            const emailsToAdd = participantEmails.filter(email => !currentEmails.includes(email));
            const participantsToRemove = currentParticipants.filter(p => !participantEmails.includes(p.user.email));

            for (const email of emailsToAdd) {
                await this.createParticipant(eventId, email);
            }

            for (const participant of participantsToRemove) {
                await this.participantRepository.deleteParticipant(eventId, participant.user_id);
            }
        }

        const event = await this.eventRepository.updateEvent(eventId, rest);

        return event;
    }

}
