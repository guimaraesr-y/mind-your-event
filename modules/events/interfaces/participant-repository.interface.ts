export interface IParticipantRepository {
    createParticipant(eventId: string, userId: string, inviteToken: string): Promise<any>;
    getParticipantsByEventId(eventId: string): Promise<any[]>;
    getParticipantByInviteToken(token: string): Promise<any | null>;
    getParticipantByEventAndUser(eventId: string, userId: string): Promise<any | null>;
    updateParticipantStatus(eventId: string, userId: string, hasSubmitted: boolean): Promise<void>;
    updateRsvp(eventId: string, inviteToken: string, willAttend: boolean): Promise<void>;
    deleteParticipant(eventId: string, userId: string): Promise<void>;
}
