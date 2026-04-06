# Database Schema

PostgreSQL database managed via Prisma ORM with Supabase.

## Models

### User

```prisma
model User {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String   @unique
  name          String
  session_token String?  @unique
  created_at    DateTime @default(now()) @db.Timestamptz(6)
  
  events        Event[]
  participants  EventParticipant[]
  availabilities AvailabilitySlot[]
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| email | String | Unique user email |
| name | String | Display name |
| session_token | String? | Auth session token |
| created_at | Timestamp | Account creation time |

### Event

```prisma
model Event {
  id                   String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title                String
  description          String?
  creator_id           String   @db.Uuid
  invite_token         String   @unique @default(dbgenerated("gen_random_uuid()"))
  start_date           DateTime @db.Date
  end_date             DateTime @db.Date
  start_time           String?  @db.VarChar(8)
  end_time             String?  @db.VarChar(8)
  is_finalized         Boolean  @default(false)
  finalized_date       DateTime? @db.Date
  finalized_start_time String?  @db.VarChar(8)
  finalized_end_time   String?  @db.VarChar(8)
  created_at           DateTime @default(now()) @db.Timestamptz(6)
  updated_at           DateTime @default(now()) @db.Timestamptz(6)
  
  creator              User    @relation(fields: [creator_id], references: [id], onDelete: Cascade)
  participants         EventParticipant[]
  availabilities       AvailabilitySlot[]
}
```

### EventParticipant

```prisma
model EventParticipant {
  id            String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_id      String   @db.Uuid
  user_id       String   @db.Uuid
  invite_token  String   @unique
  has_submitted Boolean? @default(false)
  will_attend   Boolean?
  created_at    DateTime @default(now()) @db.Timestamptz(6)
  
  event         Event   @relation(fields: [event_id], references: [id], onDelete: Cascade)
  user          User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@unique([event_id, user_id])
}
```

### AvailabilitySlot

```prisma
model AvailabilitySlot {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  event_id   String   @db.Uuid
  user_id    String   @db.Uuid
  date       DateTime @db.Date
  start_time String   @db.VarChar(8)
  end_time   String   @db.VarChar(8)
  created_at DateTime @default(now()) @db.Timestamptz(6)
  
  event      Event   @relation(fields: [event_id], references: [id], onDelete: Cascade)
  user       User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
}
```

### AuthToken

```prisma
model AuthToken {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email      String
  token      String   @unique
  expires_at DateTime @db.Timestamptz(6)
  used       Boolean  @default(false)
  created_at DateTime @default(now()) @db.Timestamptz(6)
}
```

### Notification

```prisma
enum NotificationType {
  AVAILABILITY_SUBMITTED
  EVENT_FINALIZED
  RSVP_SUBMITTED
  PRODUCT_ANNOUNCEMENT
  SYSTEM_UPDATE
  USER_ONBOARDING
  JOIN_EVENT_CONFIRMATION
  NEW_EVENT_INVITE
}

model Notification {
  id         String           @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  user_id    String           @db.Uuid
  type       NotificationType
  title      String
  message    String
  data       Json?
  is_read    Boolean          @default(false)
  created_at DateTime         @default(now()) @db.Timestamptz(6)
  
  user       User             @relation(fields: [user_id], references: [id], onDelete: Cascade)
  
  @@index([user_id, is_read])
  @@index([user_id, created_at])
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to User |
| type | Enum | Notification type (see values above) |
| title | String | Notification title |
| message | String | Notification body text |
| data | JSON? | Additional context (eventId, link, etc.) |
| is_read | Boolean | Read status |
| created_at | Timestamp | Creation time |

### NotificationType Values

| Value | Description |
|-------|-------------|
| `AVAILABILITY_SUBMITTED` | Participant submitted availability |
| `EVENT_FINALIZED` | Event was finalized |
| `RSVP_SUBMITTED` | Participant responded to RSVP |
| `JOIN_EVENT_CONFIRMATION` | User successfully joined event |
| `NEW_EVENT_INVITE` | User was invited to event |
| `PRODUCT_ANNOUNCEMENT` | Product update (future) |
| `SYSTEM_UPDATE` | System notice (future) |
| `USER_ONBOARDING` | Welcome tips (future) |

## Relationships

```
User 1──* Event (creator)
User 1──* EventParticipant
User 1──* AvailabilitySlot
User 1──* Notification
Event 1──* EventParticipant
Event 1──* AvailabilitySlot
EventParticipant *──1 User
AvailabilitySlot *──1 User
Notification *──1 User
```

## Key Files

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Full Prisma schema |
| `scripts/001_create_tables.sql` | Raw SQL (alternative) |
| `lib/db.ts` | Prisma client singleton |