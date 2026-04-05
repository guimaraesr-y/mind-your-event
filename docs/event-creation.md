# Event Creation

Allows organizers to create new events with date ranges, time windows, and participant details.

## Flow

1. User visits `/create` page
2. Fills out event creation form:
   - Title
   - Description (optional)
   - Start date / End date
   - Start time / End time
   - Participant emails (comma-separated)
3. Submits form → triggers `CreateEventUseCase`

## Use Case: `CreateEventUseCase`

**File:** `modules/events/use-cases/createEventUseCase.ts`

### Input (CreateEventDto)

```typescript
interface CreateEventDto {
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  participantEmails: string[];
  creatorEmail: string;
  creatorName: string;
  authenticatedUser?: UserInterface;
}
```

### Process

1. **Find or create creator user** via `FindOrCreateUserUseCase`
2. **Create event** in database with event details
3. **Create participants** for each email:
   - Find or create user for each email
   - Generate unique `inviteToken` for each participant
   - Create `EventParticipant` record

### Output

Returns created `Event` object with all participants, plus any failed email notifications.

```typescript
interface CreateEventResult {
  event: Event;
  failedParticipants: Array<{
    email: string;
    reason: string;
  }>;
}
```

> If some invitation emails fail to send (e.g., due to temporary network issues), the event is still created successfully and `failedParticipants` contains the list of failed emails with reasons. The EmailRetryService handles retries with exponential backoff.

## Key Files

| File | Purpose |
|------|---------|
| `app/[locale]/create/page.tsx` | Create event UI page |
| `components/create-event-form.tsx` | Event creation form component |
| `modules/events/use-cases/createEventUseCase.ts` | Business logic |
| `modules/events/repository.ts` | Database operations |

## Validation

- Title is required
- Date range must be valid (start <= end)
- Time range must be valid (start < end)
- At least one participant email required

## Notes

- Creator automatically becomes a participant
- Each participant receives a unique invite token
- Invitation emails are sent separately (via `sendEventInviteEmail` use case)
- **Email Retry:** The `EmailRetryService` (in `lib/email/email-retry.service.ts`) handles failed email deliveries with exponential backoff (3 retries by default, 1s base delay)
- **Partial Failures:** If some emails fail to send, the event is still created successfully and failed emails are reported in the response