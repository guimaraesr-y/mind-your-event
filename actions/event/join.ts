'use server';

import JoinEventUseCase from "@/modules/events/use-cases/JoinEventUseCase";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/actions/user/get-current-user";

export async function joinEvent(token: string, name: string, email: string) {
    const user = await getCurrentUser();
    const useCase = new JoinEventUseCase();
    try {
        const participant = await useCase.execute({
            token,
            name,
            email,
            authenticatedUser: user || undefined
        });
        revalidatePath(`/[locale]/invite/${token}`, 'page');
        return { success: true, inviteToken: participant.invite_token };
    } catch (error: any) {
        return { success: false, error: error.message || "Failed to join event" };
    }
}
