import { type NextRequest, NextResponse } from "next/server"
import { randomBytes } from "crypto"
import { updateUserSessionToken } from "@/actions/user/update";
import AuthRepository from "@/modules/auth/repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token } = body

    if (!email || !token) {
      return NextResponse.json({ error: "Email and token are required" }, { status: 400 })
    }

    const authRepository = new AuthRepository();

    // Find valid token
    const authToken = await authRepository.getToken(token);

    if (!authToken || authToken.email !== email || authToken.used) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 401 })
    }

    // Check if token is expired
    const now = new Date()
    const expiresAt = new Date(authToken.expires_at)

    if (now > expiresAt) {
      return NextResponse.json({ error: "Verification code has expired" }, { status: 401 })
    }

    // Mark token as used
    await authRepository.markTokenAsUsed(token);

    // Generate session token
    const sessionToken = randomBytes(32).toString("hex")
    await updateUserSessionToken(email, sessionToken);

    const response = NextResponse.json({
      success: true,
      sessionToken,
      email,
    });

    response.cookies.set('session_token', sessionToken, {
      httpOnly: false,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return response;
  } catch (error) {
    console.error("[v0] Error in POST /api/auth/verify-code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
