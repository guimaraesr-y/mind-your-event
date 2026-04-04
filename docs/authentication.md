# Authentication

Passwordless email-based authentication using verification codes.

## Authentication Flow

```
┌─────────────┐    ┌──────────────┐    ┌────────────┐
│ Enter Email │ -> │ Send Code    │ -> │ Enter Code │
└─────────────┘    └──────────────┘    └────────────┘
                                             │
                                             v
                                     ┌────────────────┐
                                     │ Create Session │
                                     └────────────────┘
                                             │
                                             v
                                      ┌──────────────┐
                                      │ Redirect     │
                                      │ to Dashboard │
                                      └──────────────┘
```

## API Endpoints

### 1. Send Verification Code

```
POST /api/auth/send-code
```

**Request:**
```typescript
{ email: string }
```

**Process:**
1. Generate 6-digit random code
2. Store code in database with expiration
3. Send email with code via Resend

### 2. Verify Code & Create Session

```
POST /api/auth/verify-code
```

**Request:**
```typescript
{ email: string; code: string }
```

**Process:**
1. Validate code against stored token
2. Find or create user
3. Generate session token (UUID)
4. Store session in user record
5. Set HTTP-only cookie (7-day expiry)

## Session Management

### Cookie Configuration

```typescript
// Cookie settings
{
  name: "session_token",
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 60 * 60 * 24 * 7, // 7 days
  path: "/"
}
```

### Session Validation

- Check cookie on each request
- Validate token against database
- Regenerate token periodically

## Key Files

| File | Purpose |
|------|---------|
| `app/api/auth/send-code/route.ts` | Send code endpoint |
| `app/api/auth/verify-code/route.ts` | Verify code endpoint |
| `modules/auth/retrieve-user.usecase.ts` | Session validation |
| `contexts/auth-context.tsx` | React auth context |

## Security Considerations

- Codes expire after limited time
- Session tokens are cryptographically random
- HTTP-only cookies prevent XSS token theft
- Production requires HTTPS

## Notes

- No password required - simpler for users
- Ideal for infrequent event scheduling
- User identity verified via email access