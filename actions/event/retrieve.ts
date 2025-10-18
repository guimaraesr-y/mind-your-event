'use server';

import { getSupabaseServerClient } from "@/lib/server";
import { AvailabilitySlot } from "@/modules/events/availabilitySlot";
import { EventInterface } from "@/modules/events/event";
import { EventParticipant } from "@/modules/events/eventParticipants";
import { PublicUserInterface, UserInterface } from "@/modules/user/user";

interface EventWithCreator extends EventInterface {
    creator: Pick<UserInterface, "name" | "email">;
}

export async function retrieveEventById(eventId: string): Promise<EventWithCreator | null> {
    const supabase = await getSupabaseServerClient();
    const { data: event, error } = await supabase
        .from("events")
        .select("*, users!events_creator_id_fkey(name, email)")
        .eq("id", eventId)
        .single();

    return event;
}

export async function retrieveEventCreator(eventId: string): Promise<PublicUserInterface | null> {
    const supabase = await getSupabaseServerClient();
    const { data: creator } = await supabase
        .from("event")
        .select("users(id, name, email)")
        .eq("id", eventId)
        .single();
    
    const users = creator?.users;
    if (users) {
        return users[0];
    }
    
    return null;
}

export async function retrieveEventsByCreatorId(userId: string): Promise<EventInterface[]> {
    const supabase = await getSupabaseServerClient();
    const { data: created } = await supabase
        .from("events")
        .select("*, users!events_creator_id_fkey(name, email), event_participants(count)")
        .eq("creator_id", userId);

    return created || [];
}

export async function retrieveParticipatingEventsByUserId(userId: string): Promise<EventInterface[]> {
    const supabase = await getSupabaseServerClient();
    const { data: participating } = await supabase
        .from("event_participants")
        .select("*, events(*, users!events_creator_id_fkey(name, email), event_participants!inner(*))")
        .eq("user_id", userId);

    return participating || [];
}

interface EventParticipantWithUser extends EventParticipant {
    users: Pick<UserInterface, "name" | "email">
}

export async function retrieveEventParticipants(eventId: string): Promise<EventParticipantWithUser[]> {
    const supabase = await getSupabaseServerClient();
    const { data: participants } = await supabase
        .from("event_participants")
        .select("*, users(name, email)")
        .eq("event_id", eventId)

    return participants || [];
}

export async function retrieveEventAvailabilities(eventId: string): Promise<AvailabilitySlot[]> {
    const supabase = await getSupabaseServerClient();
    const { data: availabilitySlots } = await supabase
        .from("availability_slots")
        .select("*, users(name, email)")
        .eq("event_id", eventId)

    return availabilitySlots || [];
}

export async function retrieveUserAvailabilitiesForEvent(userId: string, eventId: string): Promise<AvailabilitySlot[]> {
    const supabase = await getSupabaseServerClient();
    const { data: existingAvailability } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("event_id", eventId)
        .eq("user_id", userId)

    return existingAvailability || [];
}


interface EventParticipantWithUserAndEvent extends EventParticipantWithUser {
    events: EventInterface
}

export async function retrieveEventParticipantByInviteToken(token: string): Promise<EventParticipantWithUserAndEvent> {
    const supabase = await getSupabaseServerClient();
    const { data: participant, error: participantError } = await supabase
        .from("event_participants")
        .select("*, events(*), users(name, email)")
        .eq("invite_token", token)
        .single()

    return participant || [];
}
