# Availability Submission

Allows participants to submit their available time slots for an event.

## Flow

1. Participant receives invite email with link `/invite/[token]`
2. Visits invite page → sees event details
3. Selects available date(s) and time(s)
4. Submits availability

## Use Case: `AddUserAvailabilityUseCase`

**File:** `modules/availability/use-cases/addUserAvailabilityUseCase.ts`

### Input

```typescript
interface AddUserAvailabilityDto {
  eventId: string;
  inviteToken: string;
  slots: AvailabilitySlot[];
}

interface AvailabilitySlot {
  date: string;        // ISO date (YYYY-MM-DD)
  startTime: string;   // HH:mm format
  endTime: string;     // HH:mm format
}
```

### Process

1. **Validate user** via invite token
2. **Delete existing availabilities** for this user/event (replace mode)
3. **Insert new availability slots**
4. **Mark participant as submitted** (has_responded = true)

### Output

Updates participant status to "submitted".

## Key Files

| File | Purpose |
|------|---------|
| `app/[locale]/invite/[token]/page.tsx` | Invite page UI |
| `components/availability-form.tsx` | Availability input form |
| `modules/availability/use-cases/addUserAvailabilityUseCase.ts` | Business logic |
| `modules/availability/repository.ts` | Database operations |

## Validation

- At least one time slot required
- Date must be within event date range
- Start time must be before end time
- All slots must be within event time window

## Notes

- Users can update their availability multiple times
- Previous availability is replaced on re-submission
- Participant is marked as "responded" after submitting