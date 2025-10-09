export interface User {
  id: string
  email: string
  name: string
  created_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  creator_id: string
  start_date: string
  end_date: string
  start_time: string | null
  end_time: string | null
  is_finalized: boolean
  finalized_date: string | null
  finalized_start_time: string | null
  finalized_end_time: string | null
  created_at: string
  updated_at: string
}

export interface EventParticipant {
  id: string
  event_id: string
  user_id: string
  invite_token: string
  has_submitted: boolean
  will_attend: boolean | null
  created_at: string
}

export interface AvailabilitySlot {
  id: string
  event_id: string
  user_id: string
  date: string
  start_time: string
  end_time: string
  created_at: string
}

export interface AuthToken {
  id: string
  email: string
  token: string
  expires_at: string
  used: boolean
  created_at: string
}
