# Event Invitation

Sends personalized invite links to event participants via email.

## Flow

1. After event creation, organizer clicks "Send Invites"
2. System generates unique invite links for each participant
3. Email invitations sent via Resend/Nodemailer

## Use Case: `SendEventInviteEmailUseCase`

**File:** `modules/events/use-cases/email/sendEventInviteEmail.ts`

### Input

```typescript
interface SendEventInviteEmailDto {
  email: string;
  userName: string;
  eventTitle: string;
  eventLink: string;
  startDate: string;
  endDate: string;
}
```

### Process

1. Generates personalized email with event details
2. Includes unique invite link: `/invite/[token]`
3. Sends via Resend API

### Email Content

- Event title
- Event date range
- Personalized invite link
- Brief instructions

## Invite Link Format

```
{baseUrl}/invite/{inviteToken}
```

Example: `http://localhost:3000/invite/abc123def456...`

## Key Files

| File | Purpose |
|------|---------|
| `modules/events/use-cases/email/sendEventInviteEmail.ts` | Email logic |
| `actions/event/send-event-invite-links.ts` | Server action for sending invites |
| `lib/email.tsx` | Email service configuration |

## Participant Portal

When participant visits invite link:
- If event not finalized: Show availability submission form
- If event finalized: Show RSVP confirmation form

See [Availability Submission](./availability-submission.md) and [RSVP](./rsvp.md)