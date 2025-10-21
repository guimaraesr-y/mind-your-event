import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/server"
import { sendVerificationEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()

    // Generate 6-digit verification code
    const token = Math.floor(100000 + Math.random() * 900000).toString()

    // Set expiration to 15 minutes from now
    const expiresAt = new Date()
    expiresAt.setMinutes(expiresAt.getMinutes() + 15)

    // Store token in database
    const { error: insertError } = await supabase.from("auth_tokens").insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
      used: false,
    })

    if (insertError) {
      console.error("[v0] Error storing auth token:", insertError)
      return NextResponse.json({ error: "Failed to generate verification code" }, { status: 500 })
    }

    // Send verification email
    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in POST /api/auth/send-code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
