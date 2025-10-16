'use server';

import { getSupabaseServerClient } from "@/lib/server";
import { EventInterface } from "@/modules/events/event";

export async function retrieveEventById(eventId: string): Promise<EventInterface | null> {
    const supabase = await getSupabaseServerClient();
    const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    return event;
}

export async function retrieveEventsByCreatorId(userId: string): Promise<EventInterface[]> {
    const supabase = await getSupabaseServerClient();
    const { data: created } = await supabase
        .from("events")
        .select("*, users!events_creator_id_fkey(name, email), event_participants!inner(*)")
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

export async function retrieveEventParticipants(eventId: string): Promise<any[]> {
    const supabase = await getSupabaseServerClient();
    const { data: participants } = await supabase
        .from("event_participants")
        .select("*, users(name, email)")
        .eq("event_id", eventId)

    return participants || [];
}
