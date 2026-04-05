import { type NextRequest, NextResponse } from "next/server"
import { ApiException } from "@/lib/exceptions/api"
import { SendVerificationEmailUseCase } from "@/modules/user/usecases/sendVerificationEmailUseCase"
import { emailRetryService } from "@/lib/email/email-retry.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const useCase = new SendVerificationEmailUseCase();
    await emailRetryService.executeWithRetry(() => useCase.execute(email));

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof ApiException) {
      return NextResponse.json({ error: error.message }, { status: error.httpCode })
    }
    console.error("[v0] Error in POST /api/auth/send-code:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
