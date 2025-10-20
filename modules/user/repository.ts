import { getSupabaseServerClient } from "@/lib/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { UserInterface } from "./user";

export default class UserRepository {

    constructor() {}

    async getUserByEmail(email: string): Promise<UserInterface | null> {
        const supabase = await this.getSupabase();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

        return data;
    }

    async getUserBySessionToken(sessionToken: string): Promise<UserInterface | null> {
        const supabase = await this.getSupabase();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("session_token", sessionToken)
            .single();

        return data;
    }

    async getUserByEmailAndSessionToken(email: string, sessionToken: string): Promise<UserInterface | null> {
        const supabase = await this.getSupabase();
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq('email', email)
            .eq('session_token', sessionToken)
            .single();

        return data;
    }

    async getUserByInviteToken(inviteToken: string): Promise<UserInterface | null> {
        const supabase = await this.getSupabase();
        const { data, error } = await supabase
            .from("users")
            .select("*,event_participants!inner(invite_token)")
            .eq("event_participants.invite_token", inviteToken)
            .single();
        
        console.log('get user by invite token', data)
        
        return data;
    }

    async updateSessionToken(email: string, sessionToken: string): Promise<void> {
        const supabase = await this.getSupabase();
        const { error } = await supabase
            .from("users")
            .update({ session_token: sessionToken })
            .eq("email", email);
    }

  private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
    return await getSupabaseServerClient();
  }

}
