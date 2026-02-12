import { z } from "zod";
import { UserInterface } from "../user/user";

export const updateEventSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    start_date: z.string().min(1).optional(),
    end_date: z.string().min(1).optional(),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    participantEmails: z.array(z.string().email()).optional(),
});

export interface EventInterface {
    id: string;
    title: string;
    description: string;
    creator_id: string;
    invite_token: string;
    start_date: string;
    end_date: string;
    start_time: string;
    end_time: string;
    is_finalized: boolean;
    finalized_date: string;
    finalized_start_time: string;
    finalized_end_time: string;
    created_at: string;
    updated_at: string;
}

export interface CreateEventDto {
    title: string;
    description?: string;
    start_date: string;
    end_date: string;
    start_time?: string;
    end_time?: string;
    participantEmails: string[];
    creatorName: string;
    creatorEmail: string;
    authenticatedUser?: UserInterface;
}

export type UpdateEventDto = z.infer<typeof updateEventSchema>;
