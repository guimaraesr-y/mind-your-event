'use server';

import { AvailabilitySlot } from "@/modules/events/availabilitySlot";
import { EventInterface } from "@/modules/events/event";
import { EventParticipant } from "@/modules/events/eventParticipants";
import { PublicUserInterface, UserInterface } from "@/modules/user/user";
import EventRepository from "@/modules/events/repository";
import ParticipantRepository from "@/modules/events/participant-repository";
import AvailabilityRepository from "@/modules/availability/repository";

const eventRepo = new EventRepository();
const participantRepo = new ParticipantRepository();
const availabilityRepo = new AvailabilityRepository();

interface EventWithCreator extends EventInterface {
    creator: Pick<UserInterface, "name" | "email">;
}

export async function retrieveEventById(eventId: string): Promise<EventWithCreator | null> {
    return await eventRepo.getEventById(eventId);
}

export async function retrieveEventCreator(eventId: string): Promise<PublicUserInterface | null> {
    const event = await eventRepo.getEventById(eventId);
    return event?.creator || null;
}

export async function retrieveEventsByCreatorId(userId: string): Promise<EventInterface[]> {
    return await eventRepo.getEventsByCreatorId(userId);
}

export interface EventWithAvailabilitySlotsInterface extends EventInterface {
    availability_slots: AvailabilitySlot[]
}

export interface EventParticipantWithEvent extends EventParticipant {
    events: EventWithAvailabilitySlotsInterface
}

export async function retrieveParticipatingEventsByUserId(userId: string): Promise<EventParticipantWithEvent[]> {
    const participating = await participantRepo.getParticipatingEventsByUserId(userId);
    return participating.map(p => ({
        ...p,
        events: {
            ...p.event,
            availability_slots: p.event.availabilities
        }
    }));
}

interface EventParticipantWithUser extends EventParticipant {
    users: Pick<UserInterface, "name" | "email">
}

export async function retrieveEventParticipants(eventId: string): Promise<EventParticipantWithUser[]> {
    const participants = await participantRepo.getParticipantsByEventId(eventId);
    return participants.map(p => ({
        ...p,
        users: p.user
    }));
}

export async function retrieveEventAvailabilities(eventId: string): Promise<AvailabilitySlot[]> {
    const availabilities = await availabilityRepo.getEventAvailabilities(eventId);
    return availabilities.map(a => ({
        ...a,
        users: a.user
    }));
}

export async function retrieveUserAvailabilitiesForEvent(userId: string, eventId: string): Promise<AvailabilitySlot[]> {
    return await availabilityRepo.getUserAvailabilitiesForEvent(userId, eventId);
}

interface EventParticipantWithUserAndEvent extends EventParticipantWithUser {
    events: EventInterface
}

export async function retrieveEventParticipantByInviteToken(token: string): Promise<EventParticipantWithUserAndEvent> {
    const participant = await participantRepo.getParticipantByInviteToken(token);
    if (!participant) return null as any;

    return {
        ...participant,
        users: participant.user,
        events: participant.event
    };
}

export async function isEventOwner(userId?: string, eventId?: string): Promise<boolean> {
    if (!userId || !eventId) {
        return false;
    }
    return await eventRepo.isEventOwner(userId, eventId);
}
