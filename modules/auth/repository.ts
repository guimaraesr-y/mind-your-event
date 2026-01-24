import prisma from "@/lib/db";
import { IAuthRepository } from "./interfaces/auth-repository.interface";

export default class AuthRepository implements IAuthRepository {

    async createToken(email: string, token: string, expiresAt: Date): Promise<void> {
        await prisma.authToken.create({
            data: {
                email,
                token,
                expires_at: expiresAt,
            }
        });
    }

    async getToken(token: string): Promise<any> {
        return await prisma.authToken.findUnique({
            where: { token }
        });
    }

    async markTokenAsUsed(token: string): Promise<void> {
        await prisma.authToken.update({
            where: { token },
            data: { used: true }
        });
    }
}
