# Event Finalization

Allows event organizer to lock in a final date and time for the event.

## Flow

1. Organizer views event results page
2. Reviews availability heatmap and best time slots
3. Selects desired date/time from suggested slots
4. Clicks "Finalize Event"
5. System marks event as finalized and notifies all participants

## Use Case: `FinalizeEventUseCase`

**File:** `modules/events/use-cases/finalizeEventUseCase.ts`

### Input

```typescript
interface FinalizeEventDto {
  eventId: string;
  finalizedDate: string;
  finalizedStartTime: string;
  finalizedEndTime: string;
}
```

### Process

1. **Check if already finalized** - prevents duplicate finalization
2. **Update event** with final date/time:
   - `is_finalized: true`
   - `finalized_date`
   - `finalized_start_time`
   - `finalized_end_time`
3. **Notify all participants** via email

## Email Notification

Triggers `SendEventFinalizedEmailUseCase` for each participant:

```typescript
interface SendEventFinalizedEmailDto {
  email: string;
  userName: string;
  eventTitle: string;
  eventLink: string;  // Link to RSVP page
  finalizedDate: string;
  finalizedTime: string;
}
```

### Email Content

- Event title
- Finalized date and time
- RSVP link to confirm attendance

## Validation

- Event cannot already be finalized
- Selected date must be within event date range
- Selected time must be within event time window

## Key Files

| File | Purpose |
|------|---------|
| `app/[locale]/events/[eventId]/page.tsx` | Event dashboard |
| `modules/events/use-cases/finalizeEventUseCase.ts` | Business logic |
| `modules/events/use-cases/email/sendEventFinalizedEmail.ts` | Finalization email |

## Notes

- Once finalized, participants cannot update availability
- Participants receive email with RSVP link
- See [RSVP](./rsvp.md) for confirmation flow