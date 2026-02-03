import { randomBytes } from "crypto";
import { IUserRepository } from "@/modules/user/interfaces/user-repository.interface";
import { IEventRepository } from "../interfaces/event-repository.interface";
import { IParticipantRepository } from "../interfaces/participant-repository.interface";
import UserRepository from "@/modules/user/repository";
import EventRepository from "../repository";
import ParticipantRepository from "../participant-repository";
import { ApiException } from "@/lib/exceptions/api";
import { EventParticipant } from "../eventParticipants";
import { UserInterface } from "@/modules/user/user";
import { getTranslations } from "next-intl/server";

interface JoinEventRequest {
    token: string;
    name: string;
    email: string;
    authenticatedUser?: UserInterface;
}

export default class JoinEventUseCase {
    constructor(
        private userRepository: IUserRepository = new UserRepository(),
        private eventRepository: IEventRepository = new EventRepository(),
        private participantRepository: IParticipantRepository = new ParticipantRepository(),
        private translations = getTranslations("JoinEvent")
    ) { }

    public async execute(request: JoinEventRequest): Promise<EventParticipant> {
        const t = await this.translations;
        const event = await this.eventRepository.getEventByInviteToken(request.token);
        this.ensureEventExists(event, t);

        const user = await this.findOrCreateUser(request, t);

        const existingParticipant = await this.participantRepository.getParticipantByEventAndUser(event.id, user.id);
        if (existingParticipant) {
            return existingParticipant;
        }

        const inviteToken = this.generateInviteToken();
        const participant = await this.participantRepository.createParticipant(event.id, user.id, inviteToken);

        return participant;
    }

    private ensureEventExists(event: any, t: any): void {
        if (!event) {
            throw new ApiException(t("eventNotFound"), 404);
        }
    }

    private async findOrCreateUser(request: JoinEventRequest, t: any) {
        const existingUser = await this.userRepository.getUserByEmail(request.email);

        if (existingUser) {
            this.ensureUserIsAuthenticated(existingUser, request.authenticatedUser, t);
            return existingUser;
        }

        return await this.userRepository.createUser({
            email: request.email,
            name: request.name,
            session_token: "",
        });
    }

    private ensureUserIsAuthenticated(existingUser: UserInterface, authenticatedUser: UserInterface | undefined, t: any): void {
        if (!authenticatedUser || authenticatedUser.id !== existingUser.id) {
            throw new ApiException(t("alreadyRegistered"), 401);
        }
    }

    private generateInviteToken(): string {
        return randomBytes(32).toString("hex");
    }
}
