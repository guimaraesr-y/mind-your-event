import { randomBytes } from "crypto";
import { CreateEventDto, EventInterface } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";
import FindOrCreateUserUseCase from "@/modules/user/usecases/findOrCreateUserUseCase";

export interface CreateEventResult {
    event: EventInterface;
    failedParticipants: FailedParticipant[];
}

export interface FailedParticipant {
    email: string;
    reason: string;
}

export default class CreateEventUseCase {

    constructor(
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private findOrCreateUserUseCase: FindOrCreateUserUseCase = new FindOrCreateUserUseCase(),
    ) { }

    private async createEventParticipants(eventId: string, emails: string[]): Promise<FailedParticipant[]> {
        const failedParticipants: FailedParticipant[] = [];

        for (const email of emails) {
            try {
                const { user } = await this.findOrCreateUserUseCase.execute(email, email.split("@")[0]);
                const inviteToken = randomBytes(32).toString("hex");
                await this.participantRepository.createParticipant(eventId, user.id, inviteToken);
            } catch (error) {
                const reason = error instanceof Error ? error.message : "Unknown error";
                console.error(`Failed to create event participant for ${email}:`, error);
                failedParticipants.push({ email, reason });
            }
        }

        return failedParticipants;
    }

    public async execute(eventData: CreateEventDto): Promise<CreateEventResult> {
        const { participantEmails, creatorEmail, creatorName, authenticatedUser, ...rest } = eventData;

        const { user: creator, created } = await this.findOrCreateUserUseCase.execute(creatorEmail, creatorName);

        if ((!authenticatedUser && !created) || (authenticatedUser && !created && authenticatedUser.id !== creator.id)) {
            throw new ApiException("This user already exists. Please, verify your email.", 400);
        }

        const event = await this.eventRepository.createEvent({
            title: rest.title,
            description: rest.description,
            start_date: rest.start_date,
            end_date: rest.end_date,
            start_time: rest.start_time,
            end_time: rest.end_time,
            creator_id: creator.id,
        });

        const failedParticipants = await this.createEventParticipants(event.id, participantEmails);

        return {
            event,
            failedParticipants,
        };
    }

}
