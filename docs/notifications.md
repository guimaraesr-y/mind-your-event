# Notification System

The MindYourEvent notification system provides real-time in-app notifications for event-related activities. This document covers the complete architecture, API endpoints, and integration details.

## Overview

The notification system is built on a **Domain Events pattern** that decouples notification triggering from business logic. When domain events occur (like a user submitting availability), the event is published to an event bus, and notification handlers process these events asynchronously to create notifications for users.

### Key Features

| Feature | Description |
|---------|-------------|
| Domain Events | Decoupled architecture using pub/sub pattern |
| 8 Notification Types | Event, product, and system notifications |
| Cursor Pagination | Efficient pagination for large notification lists |
| Transaction Support | Atomic batch operations |
| ISP-Compliant | Split interfaces for clean dependencies |
| Error Resilient | Handlers never throw - best-effort notifications |

---

## Architecture

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Use Cases                                  │
│  (AddUserAvailability, FinalizeEvent, SaveRsvp, JoinEvent,        │
│   CreateEvent)                                                       │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ emits domain event
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Event Bus                                    │
│                      (lib/events/event-bus.ts)                      │
│         ┌─────────────────────────────────────────┐                  │
│         │  Handlers Map                            │                  │
│         │  AVAILABILITY_SUBMITTED → [handler]     │                  │
│         │  EVENT_FINALIZED → [handler]            │                  │
│         │  RSVP_SUBMITTED → [handler]             │                  │
│         │  JOIN_EVENT → [handler]                 │                  │
│         │  NEW_EVENT_INVITE → [handler]           │                  │
│         └─────────────────────────────────────────┘                  │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ subscribes
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Notification Handlers                            │
│  - AvailabilitySubmittedHandler                                      │
│  - EventFinalizedHandler                                            │
│  - RsvpSubmittedHandler                                            │
│  - JoinEventHandler                                                 │
│  - NewEventInviteHandler                                           │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ creates notification
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Notification Module                              │
│  ┌─────────────────┐  ┌──────────────────┐                          │
│  │ Repository      │  │ Service          │                          │
│  │ (CRUD)          │  │ (Domain Logic)   │                          │
│  └─────────────────┘  └──────────────────┘                          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ persists
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Database                                      │
│                 (PostgreSQL via Prisma)                              │
└─────────────────────────────────────────────────────────────────────┘
```

### Module Structure

```
lib/events/                          # Event Bus Infrastructure
├── index.ts                         # Module exports
├── domain-events.ts                 # Domain event types and interfaces
└── event-bus.ts                     # Pub/sub implementation

modules/notifications/
├── index.ts                         # Module entry + handler registration
├── types/
│   └── notification.types.ts       # TypeScript interfaces
├── interfaces/
│   ├── notification-repository.interface.ts  # ISP: Repository interface
│   └── notification-service.interface.ts    # ISP: Service interface
├── repository/
│   └── notification-repository.ts   # Prisma implementation
├── services/
│   └── notification-service.ts     # Domain notification methods
└── handlers/
    ├── availability-submitted-handler.ts
    ├── event-finalized-handler.ts
    ├── rsvp-submitted-handler.ts
    ├── join-event-handler.ts
    └── new-event-invite-handler.ts

app/api/notifications/
├── route.ts                         # GET (list), PATCH (mark all read)
├── unread-count/
│   └── route.ts                     # GET unread count
└── [id]/
    └── route.ts                     # PATCH (mark read), DELETE
```

---

## Database Schema

### Prisma Models

```prisma
// prisma/schema.prisma

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
  @@map("notifications")
}
```

### Migration

The notification system was added via migration:
- `prisma/migrations/20260405000000_add_notifications/migration.sql`

### User Relation

The existing `User` model was updated with the notifications relation:

```prisma
model User {
  id            String             @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  email         String             @unique
  name          String
  session_token String?            @unique
  created_at    DateTime?          @default(now()) @db.Timestamptz(6)
  events        Event[]
  participants  EventParticipant[]
  availabilities AvailabilitySlot[]
  notifications Notification[]     // Added relation

  @@map("users")
}
```

---

## Notification Types

| Type | Trigger | Recipient | Description |
|------|---------|-----------|-------------|
| `AVAILABILITY_SUBMITTED` | Participant submits availability | Organizer | Notifies when participant submits their availability |
| `EVENT_FINALIZED` | Organizer finalizes event | All participants | Notifies when event date/time is confirmed |
| `RSVP_SUBMITTED` | Participant responds to RSVP | Organizer | Notifies when participant confirms/declines attendance |
| `JOIN_EVENT_CONFIRMATION` | User joins event | Participant | Confirmation that user has successfully joined |
| `NEW_EVENT_INVITE` | Organizer creates event | Invitee | Notifies when user is invited to an event |
| `PRODUCT_ANNOUNCEMENT` | Admin trigger | All users | New feature releases (future) |
| `SYSTEM_UPDATE` | Admin trigger | All users | System maintenance/notices (future) |
| `USER_ONBOARDING` | Auto-trigger | New users | Welcome tips for new users (future) |

---

## API Endpoints

### GET /api/notifications

Get paginated notifications for the authenticated user.

**Authentication:** Required (session cookie)

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| cursor | string | No | - | ISO timestamp for cursor-based pagination |
| limit | number | No | 20 | Max items to return (max: 100) |
| includeRead | boolean | No | false | Include already-read notifications |

**Response:**

```typescript
{
  items: Array<{
    id: string;
    userId: string;
    type: "AVAILABILITY_SUBMITTED" | "EVENT_FINALIZED" | ...;
    title: string;
    message: string;
    data: {
      eventId?: string;
      eventTitle?: string;
      participantName?: string;
      link?: string;
    } | null;
    isRead: boolean;
    createdAt: string; // ISO 8601
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}
```

**Example Request:**

```bash
curl -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications?limit=20&includeRead=false"
```

**Example Response:**

```json
{
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "userId": "550e8400-e29b-41d4-a716-446655440001",
      "type": "AVAILABILITY_SUBMITTED",
      "title": "Availability Submitted",
      "message": "John Doe has submitted their availability for \"Team Meeting\"",
      "data": {
        "eventId": "550e8400-e29b-41d4-a716-446655440002",
        "eventTitle": "Team Meeting",
        "participantName": "John Doe"
      },
      "isRead": false,
      "createdAt": "2026-04-05T10:30:00.000Z"
    }
  ],
  "nextCursor": "2026-04-05T10:30:00.000Z",
  "hasMore": true
}
```

---

### GET /api/notifications/unread-count

Get the count of unread notifications for the badge display.

**Authentication:** Required (session cookie)

**Response:**

```typescript
{
  unreadCount: number
}
```

**Example:**

```bash
curl -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/unread-count"
```

```json
{
  "unreadCount": 5
}
```

---

### PATCH /api/notifications/:id

Mark a single notification as read.

**Authentication:** Required (session cookie)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification UUID |

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X PATCH -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/550e8400-e29b-41d4-a716-446655440000"
```

```json
{
  "success": true
}
```

---

### DELETE /api/notifications/:id

Delete a notification.

**Authentication:** Required (session cookie)

**URL Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Notification UUID |

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X DELETE -H "Cookie: session_token=..." \
  "https://localhost:3000/api/notifications/550e8400-e29b-41d4-a716-446655440000"
```

```json
{
  "success": true
}
```

---

### PATCH /api/notifications (Bulk)

Mark all notifications as read.

**Authentication:** Required (session cookie)

**Request Body:**

```typescript
{
  action: "markAllRead"
}
```

**Response:**

```typescript
{
  success: boolean
}
```

**Example:**

```bash
curl -X PATCH -H "Cookie: session_token=..." -H "Content-Type: application/json" \
  -d '{"action": "markAllRead"}' \
  "https://localhost:3000/api/notifications"
```

```json
{
  "success": true
}
```

---

## Error Responses

All endpoints return consistent error responses:

| Status | Error | Description |
|--------|-------|-------------|
| 400 | `Invalid action` | Invalid bulk action |
| 401 | `Unauthorized` | Missing or invalid session |
| 500 | `Internal server error` | Server-side failure |

**Example Error Response:**

```json
{
  "error": "Unauthorized"
}
```

---

## Domain Events Integration

### Event Types

The system defines five domain event types in `lib/events/domain-events.ts`:

```typescript
export enum DomainEventType {
  AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
  EVENT_FINALIZED = 'EVENT_FINALIZED',
  RSVP_SUBMITTED = 'RSVP_SUBMITTED',
  JOIN_EVENT = 'JOIN_EVENT',
  NEW_EVENT_INVITE = 'NEW_EVENT_INVITE',
}
```

### Event Payloads

Each event type has a specific payload structure:

```typescript
// AVAILABILITY_SUBMITTED
{
  type: "AVAILABILITY_SUBMITTED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantId: string;
    participantName: string;
    organizerId: string;
  },
  timestamp: Date;
}

// EVENT_FINALIZED
{
  type: "EVENT_FINALIZED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantIds: string[];
  },
  timestamp: Date;
}

// RSVP_SUBMITTED
{
  type: "RSVP_SUBMITTED",
  payload: {
    eventId: string;
    eventTitle: string;
    participantId: string;
    participantName: string;
    organizerId: string;
    willAttend: boolean;
  },
  timestamp: Date;
}

// JOIN_EVENT
{
  type: "JOIN_EVENT",
  payload: {
    eventId: string;
    eventTitle: string;
    userId: string;
  },
  timestamp: Date;
}

// NEW_EVENT_INVITE
{
  type: "NEW_EVENT_INVITE",
  payload: {
    eventId: string;
    eventTitle: string;
    userId: string;
    organizerName: string;
  },
  timestamp: Date;
}
```

### Use Case Integration

Each use case emits domain events instead of calling notification services directly:

| Use Case | Event Emitted |
|----------|---------------|
| `addUserAvailabilityUseCase.ts` | `AVAILABILITY_SUBMITTED` |
| `finalizeEventUseCase.ts` | `EVENT_FINALIZED` |
| `SaveRsvpUseCase.ts` | `RSVP_SUBMITTED` |
| `JoinEventUseCase.ts` | `JOIN_EVENT` |
| `createEventUseCase.ts` | `NEW_EVENT_INVITE` |

**Example: Adding availability emits event**

```typescript
// modules/availability/use-cases/addUserAvailabilityUseCase.ts
const event = await this.eventRepository.getEventById(payload.eventId);
if (event && event.creator_id !== user.id) {
  await eventBus.publish({
    type: DomainEventType.AVAILABILITY_SUBMITTED,
    payload: {
      eventId: payload.eventId,
      eventTitle: event.title,
      participantId: user.id,
      participantName: user.name,
      organizerId: event.creator_id
    },
    timestamp: new Date()
  });
}
```

### Handler Registration

Handlers are registered when the notification module is loaded:

```typescript
// modules/notifications/index.ts
export function registerNotificationHandlers(): void {
  new AvailabilitySubmittedHandler(notificationService);
  new EventFinalizedHandler(notificationService);
  new RsvpSubmittedHandler(notificationService);
  new JoinEventHandler(notificationService);
  new NewEventInviteHandler(notificationService);
}
```

Handlers are initialized in each API route:

```typescript
// app/api/notifications/route.ts
import { registerNotificationHandlers } from "@/modules/notifications";

registerNotificationHandlers();
```

### Error Handling

**Critical Rule:** Event handlers must NEVER throw. Notifications are best-effort, and the main operation must always succeed.

```typescript
// modules/notifications/handlers/availability-submitted-handler.ts
async handle(event: AvailabilitySubmittedEvent): Promise<void> {
  try {
    await this.notificationService.notifyAvailabilitySubmitted(...);
  } catch (error) {
    console.error('Failed to send availability notification:', error);
    // Do NOT re-throw - main operation must succeed
  }
}
```

---

## Implementation Phases

### Phase 1: Core Infrastructure

| Step | Description | Status |
|------|-------------|--------|
| 1.1 | Add Prisma schema (Notification model + enum) | Complete |
| 1.2 | Create database migration | Complete |
| 1.3 | Create notification types (`types/notification.types.ts`) | Complete |
| 1.4 | Create event bus infrastructure (`lib/events/`) | Complete |
| 1.5 | Define domain events (`domain-events.ts`) | Complete |

### Phase 2: Repository + Service

| Step | Description | Status |
|------|-------------|--------|
| 2.1 | Create repository interface (`notification-repository.interface.ts`) | Complete |
| 2.2 | Create service interface (`notification-service.interface.ts`) | Complete |
| 2.3 | Implement repository with cursor pagination + transactions | Complete |
| 2.4 | Implement notification service with domain methods | Complete |

### Phase 3: Event Handlers

| Step | Description | Status |
|------|-------------|--------|
| 3.1 | Create AvailabilitySubmittedHandler | Complete |
| 3.2 | Create EventFinalizedHandler | Complete |
| 3.3 | Create RsvpSubmittedHandler | Complete |
| 3.4 | Create JoinEventHandler | Complete |
| 3.5 | Create NewEventInviteHandler | Complete |
| 3.6 | Create module entry point with handler registration | Complete |

### Phase 4: API Routes

| Step | Description | Status |
|------|-------------|--------|
| 4.1 | Create GET /notifications (cursor pagination) | Complete |
| 4.2 | Create GET /notifications/unread-count | Complete |
| 4.3 | Create PATCH /notifications/:id (mark read) | Complete |
| 4.4 | Create DELETE /notifications/:id | Complete |
| 4.5 | Create PATCH /notifications (bulk mark all read) | Complete |

### Phase 5: Use Case Integration

| Step | Description | Status |
|------|-------------|--------|
| 5.1 | Update AddUserAvailabilityUseCase to emit event | Complete |
| 5.2 | Update FinalizeEventUseCase to emit event | Complete |
| 5.3 | Update SaveRsvpUseCase to emit event | Complete |
| 5.4 | Update JoinEventUseCase to emit event | Complete |
| 5.5 | Update CreateEventUseCase to emit event | Complete |

### Phase 6: Frontend (Future)

| Step | Description |
|------|-------------|
| 6.1 | Create NotificationBell component with badge |
| 6.2 | Create NotificationDropdown/Panel component |
| 6.3 | Add to header layout |
| 6.4 | Implement polling or SWR for real-time updates |

### Phase 7: Product Notifications (Future)

| Step | Description |
|------|-------------|
| 7.1 | Create admin endpoint for bulk notifications |
| 7.2 | Add admin UI for creating announcements |

---

## Design Decisions

### Why Domain Events?

1. **Decoupling:** Use cases don't need to know about notifications. They just emit events.
2. **Extensibility:** Add new handlers without modifying existing code.
3. **Testability:** Test business logic without notification side effects.
4. **Error Isolation:** Notification failures don't affect core operations.

### Why Cursor Pagination?

- **Performance:** O(1) lookup vs O(n) offset for large datasets
- **Stability:** Results don't shift when new notifications arrive
- **Scalability:** Works efficiently with millions of notifications

### Why ISP-Compliant Interfaces?

- **Clean Dependencies:** Use cases import only what they need
- **Flexibility:** Swap implementations without changing consumers
- **Testing:** Easy to mock specific interfaces

### Why Transaction Support?

- **Atomicity:** Batch notifications all succeed or all fail
- **Data Integrity:** Prevents partial state during failures

---

## Security Considerations

1. **Ownership Validation:** All endpoints validate that the notification belongs to the authenticated user
2. **Session-Based Auth:** Uses existing session cookie authentication
3. **Input Sanitization:** Data is stored as JSON, not executed

---

## Testing Strategy

### Unit Tests
- Repository methods (CRUD operations)
- Service methods (notification creation logic)
- Event handlers (event processing)

### Integration Tests
- API endpoint responses
- Database CRUD operations
- Event publishing and handling

### E2E Tests
- Complete notification flow (trigger → create → view → mark read)

---

## Dependencies

### Existing Dependencies Used
- `lucide-react` - Bell icon for UI
- `shadcn/ui` - Button, Dropdown, Badge components

### No New Dependencies
The notification system uses only existing infrastructure.

---

## Future Enhancements

| Enhancement | Description |
|-------------|-------------|
| Real-time WebSocket | Push notifications instantly instead of polling |
| Email Digest | Daily/weekly email summary of notifications |
| Push Notifications | Mobile app push notifications |
| Admin UI | Dashboard for creating product announcements |
| Notification Preferences | User settings for notification types |