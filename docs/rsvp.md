# RSVP (Confirmation)

Allows participants to confirm whether they will attend the finalized event.

## Flow

1. Participant receives finalization email with RSVP link
2. Visits `/invite/[token]` page
3. Sees finalized event details
4. Clicks "Yes, I'll attend" or "No, I can't attend"
5. Response is recorded in database

## Use Case: `SaveRsvpUseCase`

**File:** `modules/events/use-cases/SaveRsvpUseCase.ts`

### Input

```typescript
interface SaveRsvpDto {
  eventId: string;
  inviteToken: string;
  willAttend: boolean;
}
```

### Process

1. Validate invite token exists
2. Update participant record:
   - `will_attend: boolean`
   - `rsvp_submitted_at: timestamp`

## RSVP Display

On event dashboard, organizer can see:

```
┌─────────────────────────────────────────┐
│ Participant    │ Status    │ Confirmed │
├─────────────────────────────────────────┤
│ Alice          │ Responded │ ✓ Yes     │
│ Bob            │ Responded │ ✗ No      │
│ Charlie        │ Pending   │ -         │
└─────────────────────────────────────────┘
```

## Key Files

| File | Purpose |
|------|---------|
| `components/rsvp-card.tsx` | RSVP form component |
| `app/[locale]/events/[eventId]/rsvps/page.tsx` | RSVP list page |
| `modules/events/use-cases/SaveRsvpUseCase.ts` | Business logic |

## Notes

- Participants can change their RSVP until event date
- Organizer can view RSVP statistics on dashboard
- After RSVP, participant cannot submit availability (event is finalized)