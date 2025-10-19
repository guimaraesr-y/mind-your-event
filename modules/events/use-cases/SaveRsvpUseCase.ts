import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/server";

interface SaveRsvpDto {
    eventId: string;
    inviteToken: string;
    willAttend: boolean;
}

export default class SaveRsvpUseCase {

    public async execute(payload: SaveRsvpDto) {
        const supabase = await this.getSupabase();
        const { error } = await supabase
            .from("event_participants")
            .update({ will_attend: payload.willAttend })
            .eq("has_submitted", true)
            .eq("invite_token", payload.inviteToken)
            .eq("event_id", payload.eventId)

        if (error) {
            throw new Error(error.message);
        }
    }

    private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
        return await getSupabaseServerClient();
    }

}
