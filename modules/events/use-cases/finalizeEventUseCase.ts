import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/server";
import { EventInterface } from "../event";
import { sendEventFinalizedEmail } from "@/lib/email";
import { ApiException } from "@/lib/exceptions/api";

interface FinalizeEventDto {
    eventId: string;
    finalizedDate: string;
    finalizedStartTime: string;
    finalizedEndTime: string;
}

export default class FinalizeEventUseCase {

    private async updateFinalizedEvent(
        eventId: string,
        finalizedDate: string,
        finalizedStartTime: string,
        finalizedEndTime: string,
    ): Promise<EventInterface> {
        const supabase = await this.getSupabase();
        const { data: event, error: updateError } = await supabase
            .from("events")
            .update({
                is_finalized: true,
                finalized_date: finalizedDate,
                finalized_start_time: finalizedStartTime,
                finalized_end_time: finalizedEndTime,
                updated_at: new Date().toISOString(),
            })
            .eq("id", eventId)
            .select("*")
            .single()
        
        if (updateError) {
            throw new Error("Failed to update event");
        }
        return event
    }

    private async isEventFinalized(eventId: string): Promise<boolean> {
        const supabase = await this.getSupabase();
        const { data: event } = await supabase
            .from("events")
            .select("is_finalized")
            .eq("id", eventId)
            .single()
        
        return Boolean(event?.is_finalized);
    }

    private async notificateParticipants(event: EventInterface) {
        const supabase = await this.getSupabase();
        const { data: participants } = await supabase
            .from("event_participants")
            .select("*, users(name, email)")
            .eq("event_id", event.id)
        
        if (participants) {
            for (const participant of participants) {
                await sendEventFinalizedEmail(
                    participant.users.email,
                    event.title,
                    event.finalized_date,
                    `${event.finalized_start_time} - ${event.finalized_end_time}`,
                )
            }
        }
    }

    public async execute(payload: FinalizeEventDto) {
        if (await this.isEventFinalized(payload.eventId)) {
            throw new ApiException("Event is already finalized", 400);
        }

        const event = await this.updateFinalizedEvent(
            payload.eventId,
            payload.finalizedDate,
            payload.finalizedStartTime,
            payload.finalizedEndTime
        )

        await this.notificateParticipants(event);
        return event;
    }

    private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
        return await getSupabaseServerClient();
    }

}
