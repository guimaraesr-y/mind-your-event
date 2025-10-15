import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Find valid token
    const { data: authToken, error: tokenError } = await supabase
      .from("auth_tokens")
      .select("*")
      .eq("email", email)
      .eq("token", token)
      .eq("used", false)
      .single()

    if (tokenError || !authToken) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(authToken.expires_at)

    if (now > expiresAt) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 401 })
    }

    // Mark token as used
    const { error: updateError } = await supabase.from("auth_tokens").update({ used: true }).eq("id", authToken.id)

    if (updateError) {
      console.error("[v0] Error updating auth token:", updateError)
    }

    // Generate session token
    const sessionToken = randomBytes(32).toString("hex");

    // Store session token in database
    const { error: insertError } = await supabase.from("users").update({
      session_token: sessionToken,
    }).eq("email", email)

    if (insertError) {
      console.error("[v0] Error storing session token:", insertError)
      return NextResponse.json({ error: "Failed to generate session token" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      sessionToken,
      email,
    })
  } catch (error) {
    console.error("[v0] Error in POST /api/auth/verify-code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
