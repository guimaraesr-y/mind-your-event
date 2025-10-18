export interface UserInterface {
    id: string;
    email: string;
    name: string;
    session_token: string;
    created_at: string;
}

export interface PublicUserInterface {
    id: string;
    email: string;
    name: string;
}