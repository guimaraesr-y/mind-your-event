import { UserInterface } from "../user";

export interface IUserRepository {
    createUser(payload: Partial<UserInterface>): Promise<UserInterface>;
    updateUser(payload: UserInterface): Promise<UserInterface>;
    getUserByEmail(email: string): Promise<UserInterface | null>;
    getUserBySessionToken(sessionToken: string): Promise<UserInterface | null>;
    getUserByEmailAndSessionToken(email: string, sessionToken: string): Promise<UserInterface | null>;
    getUserByInviteToken(inviteToken: string): Promise<UserInterface | null>;
    updateSessionToken(email: string, sessionToken: string): Promise<void>;
}
