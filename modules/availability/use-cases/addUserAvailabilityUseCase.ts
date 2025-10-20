import { type SupabaseClient } from "@supabase/supabase-js";
import { ApiException } from "@/lib/exceptions/api";
import { getSupabaseServerClient } from "@/lib/server";
import UserRepository from "@/modules/user/repository";

export interface AvailabilitySlot {
    date: string;
    startTime: string;
    endTime: string;
}

export interface AddUserAvailabilityDto {
    eventId: string;
    inviteToken: string;
    slots: AvailabilitySlot[];
}

export default class AddUserAvailabilityUseCase {

    constructor(
        private userRepository = new UserRepository()
    ) {}

    public async execute(payload: AddUserAvailabilityDto) {
        const user = await this.userRepository.getUserByInviteToken(payload.inviteToken);
        if (!user) {
            throw new ApiException("User not found", 404);
        }

        await this.deleteExistingAvailabilities(payload.eventId, user.id);
        await this.insertNewAvailabilities(payload.eventId, user.id, payload.slots);
        await this.updateParticipantStatus(payload.eventId, user.id);
    }

    private async deleteExistingAvailabilities(eventId: string, userId: string) {
        const supabase = await this.getSupabase();
        const { error: deleteError } = await supabase
            .from("availability_slots")
            .delete()
            .eq("event_id", eventId)
            .eq("user_id", userId);

        if (deleteError) {
            console.error("[v0] Error deleting existing slots:", deleteError);
            throw new ApiException("Failed to delete old availabilities", 500);
        }
    }

    private async insertNewAvailabilities(eventId: string, userId: string, slots: AvailabilitySlot[]) {
        const supabase = await this.getSupabase();
        const slotsToInsert = slots.map((slot: any) => ({
            event_id: eventId,
            user_id: userId,
            date: slot.date,
            start_time: slot.startTime,
            end_time: slot.endTime,
        }));

        const { error: insertError } = await supabase.from("availability_slots").insert(slotsToInsert);

        if (insertError) {
            console.error("[v0] Error inserting slots:", insertError);
            throw new ApiException("Failed to insert new availabilities", 500);
        }
    }

    private async updateParticipantStatus(eventId: string, userId: string) {
        const supabase = await this.getSupabase();
        const { error: updateError } = await supabase
            .from("event_participants")
            .update({ has_submitted: true })
            .eq("event_id", eventId)
            .eq("id", userId)

        if (updateError) {
            console.error("[v0] Error updating participant:", updateError)
        }
    }

    private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
        return await getSupabaseServerClient();
    }

}