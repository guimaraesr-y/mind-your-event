'use server';

import UserRepository from "@/modules/user/repository";
import { UserInterface } from "@/modules/user/user";

const repository = new UserRepository();

export async function retrieveUserByEmail(email: string): Promise<UserInterface | null> {
    const user = await repository.getUserByEmail(email);
    return user;
}

export async function retrieveUserBySessionToken(sessionToken?: string): Promise<UserInterface | null> {
    if (!sessionToken) {
        return null;
    }

    const user = await repository.getUserBySessionToken(sessionToken);
    return user;
}

export async function retrieveUserByEmailAndSessionToken(email: string, sessionToken: string): Promise<UserInterface | null> {
    const user = await repository.getUserByEmailAndSessionToken(
        email,
        sessionToken,
    );
    return user;
}
