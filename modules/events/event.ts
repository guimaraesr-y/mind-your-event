import { UserInterface } from "../user/user";

export interface EventInterface {
    id: string;
    title: string;
    description: string;
    creator_id: string;
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
