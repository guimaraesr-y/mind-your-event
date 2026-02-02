import { EventInterface } from "../event";

export interface IEventRepository {
    createEvent(eventData: Partial<EventInterface>): Promise<EventInterface>;
    updateEvent(eventId: string, eventData: Partial<EventInterface>): Promise<EventInterface>;
    getEventById(eventId: string): Promise<any | null>;
    getEventByInviteToken(token: string): Promise<any | null>;
    getEventsByCreatorId(userId: string): Promise<any[]>;
    isEventOwner(userId: string, eventId: string): Promise<boolean>;
    isEventFinalized(eventId: string): Promise<boolean>;
}
