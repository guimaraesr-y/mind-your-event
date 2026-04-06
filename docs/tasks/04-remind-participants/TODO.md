# Remind Participants Button for Pending Events

> **Optionally depends on**: Task 00 (In-App Notification System)
> 
> This task can use in-app notifications in addition to email reminders for a complete experience.

## Overview

When organizing an event, some participants may not respond to the invitation or forget to submit their availability. Currently, organizers have no built-in way to send reminders to non-responding participants.

This task implements a reminder system using **both**:
1. **Email reminder** - Traditional email with direct link to submit availability
2. **In-app notification** (optional) - Uses Task 00 notification system via Domain Events

## Technical Approach

### Part 1: Email Reminder (Required)

The reminder functionality should be implemented as a new action available to event organizers on pending events:

1. Create a new email template for reminders (similar to the initial invitation email but with a reminder context)
2. Create a new API endpoint to trigger the reminder emails
3. Track which participants have already received reminders to avoid spamming
4. UI integration in the event management interface

The email should include the event details and a direct link for participants to submit their availability.

### Part 2: In-App Notification (Optional Enhancement)

If Task 00 is already implemented, the system uses Domain Events pattern:

1. Emit a `REMINDER_SENT` domain event from the reminder use case
2. A notification handler (registered in Task 00) listens for this event and creates the in-app notification

```typescript
// lib/events/domain-events.ts - Add new event type
export enum DomainEventType {
    // ... existing types
    REMINDER_SENT = 'REMINDER_SENT',
}

export interface ReminderSentEvent {
    type: DomainEventType.REMINDER_SENT;
    payload: {
        eventId: string;
        eventTitle: string;
        participantId: string;
        participantUserId: string;
        reminderCount: number;
    };
    timestamp: Date;
}

// modules/events/use-cases/sendReminderUseCase.ts - Emit event
await this.eventBus.publish({
    type: DomainEventType.REMINDER_SENT,
    payload: {
        eventId,
        eventTitle: event.title,
        participantId: participant.id,
        participantUserId: participant.user_id,
        reminderCount: participant.reminder_count + 1
    },
    timestamp: new Date()
});
```

This provides:
- Participants see reminder in-app even if email goes to spam
- Track of when reminders were sent
- Better engagement tracking
- Decoupled architecture via Domain Events

## Files to Create/Modify

### New Files to Create

- modules/events/emails/reminder-email.tsx - Email template for availability submission reminders
- modules/events/use-cases/email/sendReminderEmail.ts - Use case for sending reminder emails
- app/api/events/[eventId]/remind/route.ts - API endpoint to trigger reminder emails
- (Optional) lib/events/domain-events.ts - Add REMINDER_SENT event type
- (Optional) modules/notifications/handlers/reminder-sent-handler.ts - Notification handler for in-app

### Files to Modify

- components/event-card.tsx - Add remind action to event cards
- components/participants-list.tsx - Add bulk remind functionality
- Internationalization files - Add reminder email and UI text
- (Optional) Task 00 handlers - Register new ReminderSentHandler

## Implementation Steps

1. **Create Reminder Email Template** - Create modules/events/emails/reminder-email.tsx following existing email templates
2. **Create Reminder Use Case** - Create modules/events/use-cases/email/sendReminderEmail.ts following existing patterns
3. **Create API Endpoint** - Create app/api/events/[eventId]/remind/route.ts to handle reminder requests
4. **Add Remind Button** - Add button to event-card.tsx for single-event reminders
5. **Add Bulk Remind** - Add bulk remind functionality to participants-list.tsx
6. **Implement Reminder Tracking** - Add logic to track and prevent duplicate reminders
7. **(Optional) Add In-App Notification** - If Task 00 is complete, integrate notification service

## Dependencies

- **OPTIONAL**: Task 00 (In-App Notification System) - If implemented, enhances this task with in-app notifications
- Uses EmailRetryService for reliable email delivery

If Task 00 is NOT implemented yet, this task can still work with email-only reminders.

## Testing

### Email Reminder
- [ ] Reminder email is sent to pending participants
- [ ] Duplicate reminders are prevented
- [ ] Email contains correct event details and availability submission link
- [ ] Bulk reminder functionality works correctly
- [ ] Error handling when email service fails

### In-App Notification (Optional)
- [ ] Notification created when reminder is sent
- [ ] Participant sees notification in their panel
- [ ] Notification links to correct event
