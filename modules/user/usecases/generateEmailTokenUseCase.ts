import { SupabaseClient } from "@supabase/supabase-js"
import { getSupabaseServerClient } from "@/lib/server"
import { ApiException } from "@/lib/exceptions/api"

interface EmailToken {
    token: string
    expiresAt: Date
}

const EXPIRES_IN_MINUTES = 15

export class GenerateEmailTokenUseCase {

    constructor(
    ) { }

    public async execute(email: string): Promise<EmailToken> {
        const token = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + EXPIRES_IN_MINUTES);

        await this.storeOnDatabase(email, token, expiresAt)
        return { token, expiresAt }
    }

    private async storeOnDatabase(email: string, token: string, expiresAt: Date) {
        const supabase = await this.getSupabase();
        const { error: insertError } = await supabase.from("auth_tokens").insert({
            email,
            token,
            expires_at: expiresAt.toISOString(),
            used: false,
        })

        if (insertError) {
            console.error("[v0] Error storing auth token:", insertError)
            throw new ApiException("Failed to store auth token", 500)
        }
    }

    private async getSupabase(): Promise<SupabaseClient<any, "public", "public", any, any>> {
        return await getSupabaseServerClient();
    }

}
