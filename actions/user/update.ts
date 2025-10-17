'use server';

import UserRepository from "@/modules/user/repository";

const repository = new UserRepository();

export async function updateUserSessionToken(email: string, sessionToken: string): Promise<void> {
    await repository.updateSessionToken(email, sessionToken);
}
