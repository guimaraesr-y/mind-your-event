import { UserInterface } from "@/modules/user/user";

export interface IParticipantRepository {
    createParticipant(eventId: string, userId: string, inviteToken: string): Promise<void>;
    getParticipantsByEventId(eventId: string): Promise<any[]>;
    updateParticipantStatus(eventId: string, userId: string, hasSubmitted: boolean): Promise<void>;
    updateRsvp(eventId: string, inviteToken: string, willAttend: boolean): Promise<void>;
}
