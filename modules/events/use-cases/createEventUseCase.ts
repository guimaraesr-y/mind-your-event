import { randomBytes } from "crypto";
import { UserInterface } from "@/modules/user/user";
import { CreateEventDto, EventInterface } from "../event";
import { ApiException } from "@/lib/exceptions/api";
import { IUserRepository } from "@/modules/user/interfaces/user-repository.interface";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import UserRepository from "@/modules/user/repository";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";

export default class CreateEventUseCase {

    constructor(
        private userRepository: IUserRepository = new UserRepository(),
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository()
    ) { }

    private async findOrCreateUser(email: string, name: string): Promise<{ user: UserInterface, created: boolean }> {
        const user = await this.userRepository.getUserByEmail(email);

        if (!user) {
            // Using a partial UserInterface for creation is not ideal, in a real app we'd have a CreateUserDto
            // For now, keeping it simple as we are migrating.
            const newUser = await this.userRepository.createUser({
                email,
                name,
                session_token: "",
            });
            return { user: newUser, created: true };
        }
        return { user, created: false };
    }

    private async createEventParticipants(eventId: string, emails: string[]): Promise<void> {
        for (const email of emails) {
            const { user } = await this.findOrCreateUser(email, email.split("@")[0]);
            const inviteToken = randomBytes(32).toString("hex");

            try {
                await this.participantRepository.createParticipant(eventId, user.id, inviteToken);
            } catch (error) {
                console.error(`Failed to create event participant for ${email}:`, error);
            }
        }
    }

    public async execute(eventData: CreateEventDto): Promise<EventInterface> {
        const { participantEmails, creatorEmail, creatorName, authenticatedUser, ...rest } = eventData;

        const { user: creator, created } = await this.findOrCreateUser(creatorEmail, creatorName);

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

        await this.createEventParticipants(event.id, participantEmails);

        return event;
    }

}
