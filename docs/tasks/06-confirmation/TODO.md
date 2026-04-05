# Confirmation: Email + In-App Notification After Joining Event

> **Depends on**: Task 00 (In-App Notification System)
> 
> This task combines email confirmation with in-app notification for a complete user experience.

## Overview

When a participant joins an event (either by accepting an invitation or by accessing the event through a shared link), they currently do not receive any confirmation. This may leave participants uncertain about whether their registration was successful.

This task implements **both**:
1. **Email confirmation** - Traditional email with event details
2. **In-app notification** - Uses Task 00 notification system via Domain Events

This provides complete closure and ensures the participant is notified even if they don't check email immediately.

## Technical Approach

> **Architecture**: Uses Domain Events pattern from Task 00 for loose coupling.

### Part 1: In-App Notification (Using Task 00)

The JoinEventUseCase already emits a `JOIN_EVENT` domain event (as specified in Task 00 Section 6.5.4). The notification handler registered in Task 00 automatically creates the in-app notification:

```
JoinEventUseCase.execute() 
    → emits JOIN_EVENT event 
    → JoinEventHandler subscribes 
    → creates notification
```

No additional code needed in JoinEventUseCase - the event emission handles this automatically.

### Part 2: Email Confirmation (Complement)

Additionally, send a confirmation email with event details:

1. The email should include the event title, description, date range, organizer name, and a link to submit availability
2. Follow existing email design patterns in the application
3. Send asynchronously using EmailRetryService to avoid blocking the join event response

### Implementation Pattern

```typescript
// modules/events/use-cases/JoinEventUseCase.ts
async execute(eventId: string, userId: string): Promise<void> {
    // ... existing join logic
    
    // Emit domain event - Task 00 handler creates in-app notification automatically
    await this.eventBus.publish({
        type: DomainEventType.JOIN_EVENT,
        payload: {
            eventId,
            eventTitle: event.title,
            userId
        },
        timestamp: new Date()
    });
    
    // Send confirmation email (separate, non-blocking)
    await this.emailService.sendParticipantConfirmation({
        userId,
        event,
        inviteToken: participant.invite_token
    });
}
```

## Files to Create/Modify

### New Files to Create

- modules/events/emails/participant-confirmation-email.tsx - Email template for participant confirmation
- modules/events/use-cases/email/sendParticipantConfirmationEmail.ts - Use case for sending confirmation emails

> **Note**: In-app notification is already handled by Task 00's JoinEventHandler - no additional notification files needed.

### Files to Modify

- modules/events/use-cases/JoinEventUseCase.ts - Add email confirmation (event emission already exists)
- lib/events/domain-events.ts - Ensure JOIN_EVENT type is defined (done in Task 00)
- prisma/schema.prisma - Ensure NotificationType enum includes JOIN_EVENT_CONFIRMATION (done in Task 00)

## Implementation Steps

> **Important**: Complete Task 00 first before implementing this task.

1. **Verify Task 00 Complete** - Ensure notification system is operational
2. **Create Confirmation Email Template** - Create modules/events/emails/participant-confirmation-email.tsx
3. **Create Email Use Case** - Create modules/events/use-cases/email/sendParticipantConfirmationEmail.ts
4. **Update JoinEventUseCase** - Modify to trigger BOTH:
   - In-app notification (via notification service from Task 00)
   - Email confirmation (via sendParticipantConfirmationEmail)
5. **Use EmailRetryService** - Ensure email is sent asynchronously
6. **Test Complete Flow** - Verify both notifications work

## Dependencies

- **BLOCKING**: Task 00 (In-App Notification System) must be completed first
- This task builds on the notification infrastructure established in Task 00

## Testing

### In-App Notification (Task 00)
- [ ] Notification created in database after join
- [ ] Notification appears in user's notification panel
- [ ] Badge count updates correctly

### Email Confirmation
- [ ] Confirmation email is sent after participant joins event
- [ ] Email contains correct event details (title, description, date range, organizer name)
- [ ] Email includes link to submit availability
- [ ] Email is sent asynchronously without blocking the join response

### Combined Flow
- [ ] Both notifications (in-app + email) work together
- [ ] Works for both authenticated and unauthenticated users
- [ ] Failure in one doesn't affect the other (error handling)
