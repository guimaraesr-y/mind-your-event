import { ApiException } from "@/lib/exceptions/api"
import { IAuthRepository } from "@/modules/auth/interfaces/auth-repository.interface"
import AuthRepository from "@/modules/auth/repository"

interface EmailToken {
    token: string
    expiresAt: Date
}

const EXPIRES_IN_MINUTES = 15

export class GenerateEmailTokenUseCase {

    constructor(
        private authRepository: IAuthRepository = new AuthRepository()
    ) { }

    public async execute(email: string): Promise<EmailToken> {
        const token = Math.floor(100000 + Math.random() * 900000).toString()
        const expiresAt = new Date()
        expiresAt.setMinutes(expiresAt.getMinutes() + EXPIRES_IN_MINUTES);

        try {
            await this.authRepository.createToken(email, token, expiresAt)
        } catch (error) {
            console.error("[v0] Error storing auth token:", error)
            throw new ApiException("Failed to store auth token", 500)
        }

        return { token, expiresAt }
    }

}
