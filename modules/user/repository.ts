import prisma from "@/lib/db";
import { UserInterface } from "./user";
import { IUserRepository } from "./interfaces/user-repository.interface";

export default class UserRepository implements IUserRepository {

    constructor() { }

    async createUser(payload: Partial<UserInterface>): Promise<UserInterface> {
        const data = await prisma.user.create({
            data: {
                email: payload.email!,
                name: payload.name!,
                session_token: payload.session_token
            }
        });

        return this.mapToUserInterface(data);
    }

    async updateUser(payload: UserInterface): Promise<UserInterface> {
        const data = await prisma.user.update({
            where: { id: payload.id },
            data: {
                email: payload.email,
                name: payload.name,
                session_token: payload.session_token
            }
        });

        return this.mapToUserInterface(data);
    }

    async getUserByEmail(email: string): Promise<UserInterface | null> {
        const data = await prisma.user.findUnique({
            where: { email }
        });

        return data ? this.mapToUserInterface(data) : null;
    }

    async getUserBySessionToken(sessionToken: string): Promise<UserInterface | null> {
        const data = await prisma.user.findUnique({
            where: { session_token: sessionToken }
        });

        return data ? this.mapToUserInterface(data) : null;
    }

    async getUserByEmailAndSessionToken(email: string, sessionToken: string): Promise<UserInterface | null> {
        const data = await prisma.user.findFirst({
            where: {
                email,
                session_token: sessionToken
            }
        });

        return data ? this.mapToUserInterface(data) : null;
    }

    async getUserByInviteToken(inviteToken: string): Promise<UserInterface | null> {
        const participant = await prisma.eventParticipant.findUnique({
            where: { invite_token: inviteToken },
            include: { user: true }
        });

        return participant ? this.mapToUserInterface(participant.user) : null;
    }

    async updateSessionToken(email: string, sessionToken: string): Promise<void> {
        await prisma.user.upsert({
            where: { email },
            update: { session_token: sessionToken },
            create: {
                email,
                name: email,
                session_token: sessionToken,
            },
        });
    }

    private mapToUserInterface(data: any): UserInterface {
        return {
            id: data.id,
            email: data.email,
            name: data.name,
            session_token: data.session_token || "",
            created_at: data.created_at?.toISOString() || ""
        };
    }

}
