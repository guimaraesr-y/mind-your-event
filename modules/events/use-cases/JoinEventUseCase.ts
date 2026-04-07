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
import { eventBus, DomainEventType } from "@/lib/events";
import { SendParticipantConfirmationEmailUseCase } from "./email/sendParticipantConfirmationEmail";
import { emailRetryService } from "@/lib/email/email-retry.service";

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
        private sendParticipantConfirmationEmail: SendParticipantConfirmationEmailUseCase = new SendParticipantConfirmationEmailUseCase(),
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

        await eventBus.publish({
            type: DomainEventType.JOIN_EVENT,
            payload: {
                eventId: event.id,
                eventTitle: event.title,
                userId: user.id
            },
            timestamp: new Date()
        });

        // Send confirmation email (non-blocking, with retry)
        this.sendConfirmationEmail(user, event, inviteToken).catch(error => {
            console.error("Failed to send confirmation email:", error);
        });

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

    private async sendConfirmationEmail(user: UserInterface, event: any, inviteToken: string): Promise<void> {
        const organizerName = event.creator?.name || "Event Organizer";
        
        await emailRetryService.executeWithRetry(() =>
            this.sendParticipantConfirmationEmail.execute({
                email: user.email,
                userName: user.name,
                eventTitle: event.title,
                eventDescription: event.description || "",
                eventStartDate: event.start_date,
                eventEndDate: event.end_date,
                organizerName,
                availabilityLink: this.getParticipantUrl(inviteToken),
            })
        );
    }

    private getParticipantUrl(token: string): string {
        const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
        return `${baseUrl}/invite/${token}`;
    }
}
