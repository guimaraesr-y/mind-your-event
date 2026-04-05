# API Endpoints

REST API endpoints for MindYourEvent.

## Authentication

### Send Verification Code

```
POST /api/auth/send-code
```

**Request:**
```typescript
{ email: string }
```

**Response (200):**
```typescript
{ success: true }
```

**Error (400):**
```typescript
{ error: "Email is required" }
```

---

### Verify Code & Create Session

```
POST /api/auth/verify-code
```

**Request:**
```typescript
{
  email: string;
  code: string;
}
```

**Response (200):**
```typescript
{ success: true }
```

**Sets Cookie:**
- `session_token` - HTTP-only, 7-day expiry

---

## Events

### Create Event

```
POST /api/events
```

**Headers:**
- `Cookie: session_token=<token>`

**Request:**
```typescript
{
  title: string;
  description?: string;
  startDate: string;      // ISO date
  endDate: string;        // ISO date
  startTime?: string;     // HH:mm
  endTime?: string;       // HH:mm
  participantEmails: string | string[];
  creatorEmail?: string;  // If not authenticated
  creatorName?: string;   // If not authenticated
}
```

**Response (200):**
```typescript
{
  eventId: string;
  success: true;
  message?: string;
  failedParticipants?: Array<{ email: string; reason: string }>;
}
```

> **Note:** If some invitation emails fail to send, `failedParticipants` will contain an array of failed email addresses with the reason. The event is still created successfully.

---

### Update Event

```
PATCH /api/events/[eventId]
```

**Headers:**
- `Cookie: session_token=<token>`

**Request:**
```typescript
{
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  participantEmails?: string[];
}
```

**Response (200):**
```typescript
{
  event: Event;
  success: true;
  message?: string;
  failedParticipants?: Array<{ email: string; reason: string }>;
}
```

> **Note:** If new participants fail to receive invitation emails, `failedParticipants` will contain an array of failed email addresses with the reason.

---

### Finalize Event

```
POST /api/events/[eventId]/finalize
```

**Headers:**
- `Cookie: session_token=<token>`

**Request:**
```typescript
{
  finalizedDate: string;       // ISO date
  finalizedStartTime: string; // HH:mm
  finalizedEndTime: string;   // HH:mm
}
```

**Response (200):**
```typescript
{ success: true; event: Event }
```

---

### Submit RSVP

```
POST /api/events/[eventId]/rsvp
```

**Request:**
```typescript
{
  inviteToken: string;
  willAttend: boolean;
}
```

**Response (200):**
```typescript
{ success: true }
```

**Errors:**
- `400` - Missing required fields
- `403` - Invalid invite token for this event
- `404` - Participant not found

> **Security:** The endpoint validates that the invite token belongs to the specified eventId (prevents IDOR attacks).

---

## Availability

### Submit Availability

```
POST /api/availability
```

**Request:**
```typescript
{
  eventId: string;
  inviteToken: string;
  slots: Array<{
    date: string;      // YYYY-MM-DD
    startTime: string; // HH:mm
    endTime: string;   // HH:mm
  }>;
}
```

**Response (200):**
```typescript
{ success: true }
```

---

## User

### Get/Update User

```
GET /api/user
POST /api/user
```

**Headers:**
- `Cookie: session_token=<token>`

See `actions/user/` for Server Actions that handle user operations.

---

## Key Files

| File | Description |
|------|-------------|
| `app/api/auth/send-code/route.ts` | Send verification code |
| `app/api/auth/verify-code/route.ts` | Verify code & login |
| `app/api/events/route.ts` | Create event |
| `app/api/events/[eventId]/route.ts` | Update event |
| `app/api/events/[eventId]/finalize/route.ts` | Finalize event |
| `app/api/events/[eventId]/rsvp/route.ts` | Submit RSVP |
| `app/api/availability/route.ts` | Submit availability |
| `app/api/user/route.ts` | User operations |