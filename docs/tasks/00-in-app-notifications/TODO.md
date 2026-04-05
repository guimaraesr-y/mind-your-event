# In-App Notification System for MindYourEvent

> **IMPORTANT**: This is the foundational system for all in-app notifications.
> - Task 01 (Notification Organizer) is now integrated here
> - Task 04 and Task 06 depend on this system
> - All event-related notifications flow through this module

## Overview

This document specifies the complete in-app notification system for MindYourEvent. The system provides real-time notifications within the application for event-related activities and product announcements.

## Current State Analysis

### Existing Email Notifications
- Event Invites - sent when event is created
- Event Finalized - sent to all participants when organizer finalizes
- Verification Codes - sent for authentication

### Notification Gap
No in-app notification system exists. Users must check email for all notifications.

## Requirements Summary

### 1. Event Notifications (In-App)
| Trigger | Recipient | Notification Type |
|---------|-----------|-------------------|
| Participant submits availability | Organizer | AVAILABILITY_SUBMITTED |
| Event is finalized | All participants | EVENT_FINALIZED |
| Participant RSVPs | Organizer | RSVP_SUBMITTED |

### 2. Product Notifications (In-App)
| Trigger | Recipient | Notification Type |
|---------|-----------|-------------------|
| New feature release | All users | PRODUCT_ANNOUNCEMENT |
| System updates | All users | SYSTEM_UPDATE |
| Onboarding tips | New users | USER_ONBOARDING |

### 3. No Auth Notifications
- Verification Codes - Email only, NOT in-app

---

## 1. Database Schema

### 1.1 New Prisma Models

In prisma/schema.prisma, add:

`prisma
model Notification {
    id          String   @id @default(dbgenerated('gen_random_uuid()')) @db.Uuid
    user_id     String   @db.Uuid
    type        NotificationType
    title       String
    message     String
    data        Json?    
    is_read     Boolean  @default(false)
    created_at  DateTime @default(now()) @db.Timestamptz(6)
    user        User     @relation(fields: [user_id], references: [id], onDelete: Cascade)

    @@index([user_id, is_read])
    @@index([user_id, created_at])
    @@map('notifications')
}

enum NotificationType {
    AVAILABILITY_SUBMITTED  
    EVENT_FINALIZED        
    RSVP_SUBMITTED         
    PRODUCT_ANNOUNCEMENT   
    SYSTEM_UPDATE          
    USER_ONBOARDING        
    JOIN_EVENT_CONFIRMATION 
}
`

### 1.2 Update Existing User Model

Add relation to notifications in existing User model:

`prisma
model User {
    id             String             @id @default(dbgenerated('gen_random_uuid()')) @db.Uuid
    email          String             @unique
    name           String
    session_token  String?            @unique
    created_at     DateTime?          @default(now()) @db.Timestamptz(6)
    events         Event[]
    participants   EventParticipant[]
    availabilities AvailabilitySlot[]
    notifications  Notification[]     

    @@map('users')
}
`

---

## 2. API Endpoints

### 2.1 Notification Routes

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/notifications | Get user notifications (paginated) | Required |
| GET | /api/notifications/unread-count | Get unread count for badge | Required |
| PATCH | /api/notifications/:id | Mark single notification as read | Required |
| PATCH | /api/notifications/mark-all-read | Mark all notifications as read | Required |
| DELETE | /api/notifications/:id | Delete single notification | Required |

### 2.2 Request/Response Formats

#### GET /api/notifications
Query Params: ?cursor=<last-notification-id>&limit=20&includeRead=true

> **Architecture Improvement**: Uses cursor-based pagination instead of offset for better performance at scale.

#### Pagination Response Format

```typescript
interface PaginatedNotifications {
    items: Notification[];
    nextCursor: string | null;
    hasMore: boolean;
}
```

#### GET /api/notifications/unread-count

#### PATCH /api/notifications/:id

---

## 3. TypeScript Interfaces

`	ypescript
export enum NotificationType {
    AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
    EVENT_FINALIZED = 'EVENT_FINALIZED',
    RSVP_SUBMITTED = 'RSVP_SUBMITTED',
    PRODUCT_ANNOUNCEMENT = 'PRODUCT_ANNOUNCEMENT',
    SYSTEM_UPDATE = 'SYSTEM_UPDATE',
    USER_ONBOARDING = 'USER_ONBOARDING',
    JOIN_EVENT_CONFIRMATION = 'JOIN_EVENT_CONFIRMATION'
}

export interface NotificationData {
    eventId?: string;
    eventTitle?: string;
    participantName?: string;
    link?: string;
    [key: string]: unknown;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: NotificationData | null;
    isRead: boolean;
    createdAt: Date;
}

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
}
`

---

## 4. Module Structure

### 4.1 New Module: notifications

`
modules/notifications/
  index.ts
  types/notification.types.ts
  interfaces/
    notification-repository.interface.ts
    notification-service.interface.ts
  repository/notification-repository.ts
  services/notification-service.ts
  use-cases/
    create-notification-use-case.ts
    get-notifications-use-case.ts
    mark-notification-read-use-case.ts
    mark-all-read-use-case.ts
    get-unread-count-use-case.ts
`

### 4.2 Notification Service Interface

> **Architecture Improvement**: Split into two interfaces to comply with ISP (Interface Segregation Principle).

#### 4.2.1 Repository Interface (CRUD Operations)

```typescript
export interface INotificationRepository {
    create(dto: CreateNotificationDto): Promise<Notification>;
    createBatch(notifications: CreateNotificationDto[]): Promise<void>;
    getByUserId(userId: string, options: CursorPaginationOptions): Promise<PaginatedNotifications>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
}

export interface CursorPaginationOptions {
    cursor?: string;
    limit: number;
    includeRead: boolean;
}
```

#### 4.2.2 Service Interface (Domain Logic)

```typescript
export interface INotificationService {
    notifyAvailabilitySubmitted(organizerId: string, eventId: string, eventTitle: string, participantName: string): Promise<void>;
    notifyEventFinalized(eventId: string, eventTitle: string): Promise<void>;
    notifyRsvpSubmitted(organizerId: string, eventId: string, eventTitle: string, participantName: string, willAttend: boolean): Promise<void>;
    notifyJoinEvent(userId: string, eventId: string, eventTitle: string): Promise<void>;
    notifyAllUsers(type: NotificationType.PRODUCT_ANNOUNCEMENT | NotificationType.SYSTEM_UPDATE, title: string, message: string): Promise<void>;
}
```

> **Note**: Service depends on repository via dependency injection. Use-cases depend on the interface they need, not concrete implementations.

---

## 5. UI Components

### 5.1 Component Structure

`
components/notifications/
  notification-bell.tsx          
  notification-dropdown.tsx     
  notification-item.tsx          
  notification-panel.tsx        
  index.ts                      
`

### 5.2 Notification Bell Component

Features:
- Bell icon from lucide-react
- Red badge showing unread count (max display: 9+ if >9)
- Click opens notification dropdown
- Subtle bounce animation when new notification arrives

### 5.3 Notification Dropdown/Panel

Features:
- Scrollable list of notifications
- Group by date (Today, Yesterday, Earlier)
- Visual distinction for read/unread (unread = bold, subtle bg highlight)
- Mark all as read button
- Link to relevant event/page via data.link
- Empty state: No notifications yet

---

## 6. Integration Points (Domain Events)

> **Architecture Improvement**: Use Domain Events pattern to decouple notification triggering from business logic. This avoids circular dependencies and enables adding new handlers without modifying existing use-cases.

### 6.1 Event Bus Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Use Cases                                  │
│  (AddUserAvailability, FinalizeEvent, SaveRsvp, JoinEvent)          │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ emits domain event
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        Event Bus                                    │
│                      (lib/events/event-bus.ts)                      │
└─────────────────────────────┬───────────────────────────────────────┘
                              │ subscribes
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Notification Handlers                            │
│  - AvailabilitySubmittedHandler                                      │
│  - EventFinalizedHandler                                            │
│  - RsvpSubmittedHandler                                            │
│  - JoinEventHandler                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 6.2 Domain Events Definition

```typescript
// lib/events/domain-events.ts
export enum DomainEventType {
    AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
    EVENT_FINALIZED = 'EVENT_FINALIZED',
    RSVP_SUBMITTED = 'RSVP_SUBMITTED',
    JOIN_EVENT = 'JOIN_EVENT',
}

export interface AvailabilitySubmittedEvent {
    type: DomainEventType.AVAILABILITY_SUBMITTED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantId: string;
        participantName: string;
        organizerId: string;
    };
    timestamp: Date;
}

export interface EventFinalizedEvent {
    type: DomainEventType.EVENT_FINALIZED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantIds: string[];
    };
    timestamp: Date;
}

export interface RsvpSubmittedEvent {
    type: DomainEventType.RSVP_SUBMITTED;
    payload: {
        eventId: string;
        eventTitle: string;
        participantId: string;
        participantName: string;
        organizerId: string;
        willAttend: boolean;
    };
    timestamp: Date;
}

export interface JoinEventEvent {
    type: DomainEventType.JOIN_EVENT;
    payload: {
        eventId: string;
        eventTitle: string;
        userId: string;
    };
    timestamp: Date;
}

export type DomainEvent = 
    | AvailabilitySubmittedEvent 
    | EventFinalizedEvent 
    | RsvpSubmittedEvent 
    | JoinEventEvent;
```

### 6.3 Event Bus Implementation

```typescript
// lib/events/event-bus.ts
export interface IEventBus {
    publish(event: DomainEvent): Promise<void>;
    subscribe<T extends DomainEvent>(
        eventType: T['type'],
        handler: (event: T) => Promise<void>
    ): void;
}

export class EventBus implements IEventBus {
    private handlers = new Map<DomainEventType, Array<(event: DomainEvent) => Promise<void>>>();

    async publish(event: DomainEvent): Promise<void> {
        const handlers = this.handlers.get(event.type) || [];
        await Promise.all(handlers.map(handler => handler(event)));
    }

    subscribe<T extends DomainEvent>(
        eventType: T['type'],
        handler: (event: T) => Promise<void>
    ): void {
        const handlers = this.handlers.get(eventType) || [];
        handlers.push(handler as (event: DomainEvent) => Promise<void>);
        this.handlers.set(eventType, handlers);
    }
}

export const eventBus = new EventBus();
```

### 6.4 Notification Handlers

```typescript
// modules/notifications/handlers/availability-submitted-handler.ts
import { eventBus } from '@/lib/events/event-bus';
import { DomainEventType, AvailabilitySubmittedEvent } from '@/lib/events/domain-events';

export class AvailabilitySubmittedHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.AVAILABILITY_SUBMITTED,
            this.handle.bind(this)
        );
    }

    async handle(event: AvailabilitySubmittedEvent): Promise<void> {
        try {
            await this.notificationService.notifyAvailabilitySubmitted(
                event.payload.organizerId,
                event.payload.eventId,
                event.payload.eventTitle,
                event.payload.participantName
            );
        } catch (error) {
            console.error('Failed to send availability notification:', error);
        }
    }
}
```

### 6.5 Use Case Integration (emit events instead of calling service directly)

> **Important**: Use-cases now emit events, they do NOT call notification service directly.

#### 6.5.1 AddUserAvailabilityUseCase

```typescript
// modules/availability/use-cases/addUserAvailabilityUseCase.ts
async execute(payload: AddUserAvailabilityPayload): Promise<void> {
    // ... existing logic for availability submission
    
    // Emit event instead of calling notification service directly
    await this.eventBus.publish({
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

#### 6.5.2 FinalizeEventUseCase

```typescript
// modules/events/use-cases/finalizeEventUseCase.ts
async execute(eventId: string): Promise<void> {
    // ... existing finalize logic
    
    // Get all participant IDs
    const participants = await this.participantRepository.getByEventId(eventId);
    const participantIds = participants.map(p => p.user_id);
    
    await this.eventBus.publish({
        type: DomainEventType.EVENT_FINALIZED,
        payload: {
            eventId,
            eventTitle: event.title,
            participantIds
        },
        timestamp: new Date()
    });
}
```

#### 6.5.3 SaveRsvpUseCase

```typescript
// modules/events/use-cases/SaveRsvpUseCase.ts
async execute(payload: SaveRsvpPayload): Promise<void> {
    // ... existing RSVP logic
    
    await this.eventBus.publish({
        type: DomainEventType.RSVP_SUBMITTED,
        payload: {
            eventId: payload.eventId,
            eventTitle: event.title,
            participantId: participant.user_id,
            participantName: participant.user.name,
            organizerId: event.creator_id,
            willAttend: payload.willAttend
        },
        timestamp: new Date()
    });
}
```

#### 6.5.4 JoinEventUseCase

```typescript
// modules/events/use-cases/JoinEventUseCase.ts
async execute(eventId: string, userId: string): Promise<void> {
    // ... existing join logic
    
    await this.eventBus.publish({
        type: DomainEventType.JOIN_EVENT,
        payload: {
            eventId,
            eventTitle: event.title,
            userId
        },
        timestamp: new Date()
    });
}
```

### 6.6 Module Registration

```typescript
// modules/notifications/index.ts - Register handlers
import { AvailabilitySubmittedHandler } from './handlers/availability-submitted-handler';
import { EventFinalizedHandler } from './handlers/event-finalized-handler';
import { RsvpSubmittedHandler } from './handlers/rsvp-submitted-handler';
import { JoinEventHandler } from './handlers/join-event-handler';

export function registerNotificationHandlers(notificationService: INotificationService): void {
    new AvailabilitySubmittedHandler(notificationService);
    new EventFinalizedHandler(notificationService);
    new RsvpSubmittedHandler(notificationService);
    new JoinEventHandler(notificationService);
}
```

### 6.7 Error Handling for Events

> **Important**: Event handlers should NEVER throw. Log errors but don't fail the main operation.

```typescript
async handle(event: AvailabilitySubmittedEvent): Promise<void> {
    try {
        await this.notificationService.notifyAvailabilitySubmitted(...);
    } catch (error) {
        console.error('Notification handler failed:', error);
        // Do not re-throw - main operation must succeed
    }
}
```

### 6.8 Frontend Integration

File: app/layout.tsx or Header component

Add notification bell to header/nav with polling or SWR for unread count.

---

## 7. Task 06 Review: Confirmation

### Current State

Task 06 (docs/tasks/06-confirmation/TODO.md) specifies:
- Send confirmation email after participant joins event
- Email includes event details and link to submit availability

### Adaptation Needed

Add in-app notification alongside email:

- Add JOIN_EVENT_CONFIRMATION notification type
- Trigger notification to participant after successful join
- This creates a complete confirmation experience (email + in-app)

### Integration Note

Task 06 should be implemented AFTER the in-app notification system (this task) is complete, OR both can be implemented together.

---

## 8. Implementation Order

### Phase 1: Core Infrastructure
1. Add Prisma schema models (Notification + User relation)
2. Create notification repository interface and implementation
3. Create notification service interface and implementation (split by ISP)
4. Create Event Bus infrastructure (lib/events/)
5. Define domain events (lib/events/domain-events.ts)
6. Run database migration

### Phase 2: Domain Events + Use Cases
7. Create notification handlers (modules/notifications/handlers/)
8. Create notification use cases (create, get, mark read, get count)
9. Register handlers in notification module
10. Create API routes for notifications

### Phase 3: Use Case Integration
11. Update AddUserAvailabilityUseCase to emit events
12. Update FinalizeEventUseCase to emit events
13. Update SaveRsvpUseCase to emit events
14. Update JoinEventUseCase to emit events (Task 06)

### Phase 4: Frontend Components
15. Create NotificationBell component with badge
16. Create NotificationDropdown/Panel component
17. Add to layout/header
18. Implement polling or SWR for real-time updates

### Phase 5: Product Notifications (Optional/Future)
19. Admin endpoint for sending bulk product notifications
20. UI for admin to create announcements

---

## 9. Acceptance Criteria

### Functional
- User can view list of their notifications
- Unread count displays correctly in badge
- User can mark single notification as read
- User can mark all notifications as read
- Notifications link to correct event/page
- Organizer receives notification when participant submits availability
- All participants receive notification when event is finalized
- Organizer receives notification when participant RSVPs
- Participant receives confirmation when joining event (Task 06)

### Non-Functional
- Notifications load within 200ms
- Badge updates without page refresh (SWR/React Query)
- Empty state handled gracefully
- Mobile responsive (dropdown adapts to screen size)

### Out of Scope
- Real-time WebSocket push (future enhancement)
- Email digest of in-app notifications
- Push notifications (mobile app)

---

## 10. Dependencies

### New Dependencies
- None required - uses existing infrastructure

### Existing Dependencies Used
- lucide-react - Bell icon
- react-toastify - Optional toast notifications
- shadcn/ui components - Button, Dropdown, Badge
- @tanstack/react-query or swr - For data fetching

---

## 11. Testing Strategy

### Unit Tests
- Notification service methods
- Use cases (create, get, mark read)
- Repository methods

### Integration Tests
- API endpoint responses
- Database CRUD operations

### E2E Tests
- Complete notification flow (trigger -> create -> view -> mark read)
- UI components render correctly

---

## 12. File Changes Summary

### New Files to Create
`
prisma/schema.prisma                    ADD: Notification model + User relation

# Event Bus Infrastructure (NEW)
lib/events/
  index.ts
  domain-events.ts                      # Domain event types and interfaces
  event-bus.ts                          # Event bus implementation

# Notification Module
modules/notifications/
  index.ts                              # Module entry + handler registration
  types/notification.types.ts
  interfaces/
    notification-repository.interface.ts
    notification-service.interface.ts
  repository/
    notification-repository.ts          # With transaction support for batch
  services/
    notification-service.ts
  handlers/                             # Domain event handlers (NEW)
    availability-submitted-handler.ts
    event-finalized-handler.ts
    rsvp-submitted-handler.ts
    join-event-handler.ts
  use-cases/
    create-notification-use-case.ts
    get-notifications-use-case.ts
    mark-notification-read-use-case.ts
    mark-all-read-use-case.ts
    get-unread-count-use-case.ts

# API Routes
app/api/notifications/
  route.ts                               # GET (cursor-based pagination)
  unread-count/route.ts
  [id]/route.ts

# Frontend Components
components/notifications/
  notification-bell.tsx
  notification-dropdown.tsx
  notification-item.tsx
  notification-panel.tsx
  index.ts

# Types
types/notifications/index.ts
`

### Files to Modify
`
modules/availability/use-cases/addUserAvailabilityUseCase.ts   EMIT: AvailabilitySubmitted event
modules/events/use-cases/finalizeEventUseCase.ts                EMIT: EventFinalized event
modules/events/use-cases/SaveRsvpUseCase.ts                     EMIT: RsvpSubmitted event
modules/events/use-cases/JoinEventUseCase.ts                    EMIT: JoinEvent event (Task 06)
app/layout.tsx or app/header.tsx                                ADD: notification bell
docs/tasks/06-confirmation-email/TODO.md                        UPDATE: add in-app notification note
`

---

## 13. Error Handling

### Notification Creation Failures
- Log error but do not fail main operation (availability submission, RSVP, etc.)
- Notifications are best-effort, not critical path
- Event handlers must NEVER throw - wrap in try/catch

### Batch Operations with Transactions
> **Architecture Improvement**: Batch operations use Prisma transactions to ensure atomicity.

```typescript
// In notification-repository.ts
async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
    await this.prisma.$transaction(
        notifications.map(dto => 
            this.prisma.notification.create({
                data: {
                    id: crypto.randomUUID(),
                    user_id: dto.userId,
                    type: dto.type,
                    title: dto.title,
                    message: dto.message,
                    data: dto.data || undefined,
                    is_read: false,
                    created_at: new Date(),
                }
            })
        )
    );
}
```

### API Error Responses
- Return 404 if notification not found
- Return 403 if trying to access another users notifications
- Return 400 for invalid input

---

## 14. Security Considerations

- Users can only access their own notifications
- Validate notification ID ownership before mark as read/delete
- Sanitize notification data before storing
- Rate limit notification creation (prevent spam)
