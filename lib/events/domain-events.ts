export enum DomainEventType {
    AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
    EVENT_FINALIZED = 'EVENT_FINALIZED',
    RSVP_SUBMITTED = 'RSVP_SUBMITTED',
    JOIN_EVENT = 'JOIN_EVENT',
    NEW_EVENT_INVITE = 'NEW_EVENT_INVITE',
}

export interface AvailabilitySubmittedEvent {
    type: DomainEventType.AVAILABILITY_SUBMITTED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantId: string;
        participantName: string;
        organizerId: string;
    };
    timestamp: Date;
}

export interface EventFinalizedEvent {
    type: DomainEventType.EVENT_FINALIZED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantIds: string[];
    };
    timestamp: Date;
}

export interface RsvpSubmittedEvent {
    type: DomainEventType.RSVP_SUBMITTED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantId: string;
        participantName: string;
        organizerId: string;
        willAttend: boolean;
    };
    timestamp: Date;
}

export interface JoinEventEvent {
    type: DomainEventType.JOIN_EVENT;
    payload: {
        eventId: string;
        eventTitle: string;
        userId: string;
    };
    timestamp: Date;
}

export interface NewEventInviteEvent {
    type: DomainEventType.NEW_EVENT_INVITE;
    payload: {
        eventId: string;
        eventTitle: string;
        userId: string;
        organizerName: string;
    };
    timestamp: Date;
}

export type DomainEvent =
    | AvailabilitySubmittedEvent
    | EventFinalizedEvent
    | RsvpSubmittedEvent
    | JoinEventEvent
    | NewEventInviteEvent;
