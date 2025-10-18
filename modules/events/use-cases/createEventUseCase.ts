import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseServerClient } from "@/lib/server";
import { randomBytes } from "crypto";
import { UserInterface } from "@/modules/user/user";
import { CreateEventDto, EventInterface } from "../event";

export default class CreateEventUseCase {

    private async findOrCreateUser(email: string, name: string): Promise<UserInterface> {
        const supabase = await this.getSupabase();
        const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !user) {
            const { data: newUser, error: insertError } = await supabase
                .from("users")
                .insert({ email, name })
                .select()
                .single();

            if (insertError) {
                throw new Error("Failed to create user");
            }
            return newUser;
        }
        return user;
    }

    private async createEventRecord(
        eventData: Partial<EventInterface>
    ): Promise<EventInterface> {
        const supabase = await this.getSupabase();
        console.log(eventData)
        const { data: event, error } = await supabase
            .from("events")
            .insert(eventData)
            .select()
            .single();

        if (error || !event) {
            throw new Error("Failed to create event", { cause: JSON.stringify(error) });
        }
        return event;
    }

    private async createEventParticipants(eventId: string, emails: string[]): Promise<void> {
        const supabase = await this.getSupabase();
        for (const email of emails) {
            const user = await this.findOrCreateUser(email, email.split("@")[0]);
            const inviteToken = randomBytes(32).toString("hex");

            const { error } = await supabase.from("event_participants").insert({
                event_id: eventId,
                user_id: user.id,
                invite_token: inviteToken,
            });

            if (error) {
                console.error(`Failed to create event participant for ${email}:`, error);
            }
        }
    }

    public async execute(eventData: CreateEventDto): Promise<EventInterface> {
        const { participantEmails, creatorEmail, creatorName, ...rest } = eventData;
        
        const creator = await this.findOrCreateUser(creatorEmail, creatorName);
        const event = await this.createEventRecord({
            title: rest.title,
            description: rest.description,
            start_date: rest.start_date,
            end_date: rest.end_date,
            start_time: rest.start_time,
            end_time: rest.end_time,
            creator_id: creator.id,
        });
        await this.createEventParticipants(event.id, participantEmails);

        return event;
    }

    private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
        return await getSupabaseServerClient();
    }

}
