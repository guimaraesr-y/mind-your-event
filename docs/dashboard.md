# Dashboard

User's central hub for managing all events they're involved in.

## Features

### User Profile Header
- Display user name (editable inline)
- Edit name by clicking pencil icon
- Quick action: "Create Event" button

### Tabs

#### 1. My Events (Organized by You)
- **Pending Events**: Events you created that aren't finalized yet
- **Confirmed Events**: Events you created that are finalized

#### 2. Invitations (Events You're Invited To)
- **Pending**: Events where you can still submit availability
- **Confirmed**: Finalized events where you can RSVP

## Data Fetching

```typescript
// Parallel fetch for performance
const [createdEvents, participatingEvents] = await Promise.all([
  retrieveEventsByCreatorId(user.id),
  retrieveParticipatingEventsByUserId(user.id),
]);
```

## Event Display Components

| Component | Purpose |
|-----------|---------|
| `CreatedEvents` | Displays events user created |
| `ParticipatingEvents` | Displays events user was invited to |

### Filtering

Events are filtered and memoized:

```typescript
const pendingCreatedEvents = createdEvents.filter(e => !e.is_finalized);
const finalizedCreatedEvents = createdEvents.filter(e => e.is_finalized);
const pendingParticipatingEvents = participatingEvents.filter(e => !e.event.is_finalized);
const finalizedParticipatingEvents = participatingEvents.filter(e => e.event.is_finalized);
```

## Onboarding

First-time users see an interactive onboarding tutorial:
- Guide to creating events
- Explanation of invitation flow
- How to finalize and get RSVPs

## Key Files

| File | Purpose |
|------|---------|
| `app/[locale]/dashboard/page.tsx` | Main dashboard page |
| `components/created-events.tsx` | Created events list |
| `components/participating-events.tsx` | Participating events list |
| `components/onboarding.tsx` | Onboarding tutorial |
| `actions/event/retrieve.ts` | Event retrieval actions |

## User Interactions

1. **Edit Name**: Click pencil icon → edit inline → blur/enter to save
2. **Create Event**: Click button → redirect to `/create`
3. **View Event**: Click event card → navigate to event details
4. **View Tutorial**: Click header icon → show onboarding modal