export interface EventParticipant {
    id: string
    event_id: string
    user_id: string
    invite_token: string
    has_submitted: boolean
    will_attend: boolean | null
    created_at: string
}
