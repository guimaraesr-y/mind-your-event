# Project Structure

```
mind-your-event/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Dynamic locale routing (en, pt)
│   │   ├── page.tsx              # Landing page
│   │   ├── create/page.tsx      # Create event page
│   │   ├── dashboard/page.tsx  # User dashboard
│   │   ├── verify/page.tsx      # Email verification page
│   │   ├── events/[eventId]/    # Event management pages
│   │   │   ├── page.tsx         # Event details (owner view)
│   │   │   ├── edit/page.tsx    # Edit event
│   │   │   ├── results/page.tsx # Availability results
│   │   │   └── rsvps/page.tsx   # RSVP management
│   │   └── invite/[token]/      # Participant invite page
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── events/              # Event CRUD
│   │   ├── availability/        # Availability submission
│   │   └── user/                # User operations
│   ├── layout.tsx              # Root layout
│   └── globals.css             # Global styles
│
├── components/                  # React components
│   ├── ui/                    # shadcn/ui primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── header.tsx             # Navigation header
│   ├── create-event-form.tsx  # Event creation form
│   ├── availability-form.tsx  # Participant availability input
│   ├── availability-heatmap.tsx # Visual availability display
│   ├── event-dashboard.tsx    # Organizer dashboard
│   ├── created-events.tsx     # User's created events
│   ├── participating-events.tsx # User's invited events
│   ├── rsvp-card.tsx           # RSVP confirmation
│   ├── onboarding.tsx          # First-time user tutorial
│   └── ...
│
├── modules/                    # Domain-driven business logic
│   ├── user/
│   │   ├── user.ts             # User interface
│   │   ├── repository.ts       # Database operations
│   │   ├── interfaces/         # Repository interfaces
│   │   └── usecases/           # User use cases
│   │       ├── findOrCreateUserUseCase.ts
│   │       └── updateUserUseCase.ts
│   │
│   ├── events/
│   │   ├── event.ts            # Event interface
│   │   ├── eventParticipants.ts # Participant interface
│   │   ├── repository.ts       # Event database operations
│   │   ├── participant-repository.ts
│   │   ├── interfaces/         # Repository interfaces
│   │   ├── services/           # Business services
│   │   │   └── event-metrics.service.ts
│   │   └── use-cases/         # Event use cases
│   │       ├── createEventUseCase.ts
│   │       ├── updateEventUseCase.ts
│   │       ├── finalizeEventUseCase.ts
│   │       ├── JoinEventUseCase.ts
│   │       ├── SaveRsvpUseCase.ts
│   │       ├── calculateBestSlotsUseCase.ts
│   │       └── email/          # Email use cases
│   │           ├── sendEventInviteEmail.ts
│   │           └── sendEventFinalizedEmail.ts
│   │
│   ├── availability/
│   │   ├── repository.ts       # Availability DB operations
│   │   ├── interfaces/         # Repository interfaces
│   │   └── use-cases/
│   │       └── addUserAvailabilityUseCase.ts
│   │
│   └── auth/                   # Authentication
│       ├── repository.ts
│       ├── interfaces/
│       └── retrieve-user.usecase.ts
│
├── actions/                    # Server Actions (RPC)
│   ├── user/
│   │   ├── retrieve.ts         # Get current user
│   │   └── update.ts          # Update user
│   └── event/
│       ├── retrieve.ts         # Get event data
│       ├── join.ts             # Join event
│       └── send-event-invite-links.ts
│
├── lib/                        # Shared utilities
│   ├── db.ts                  # Prisma client singleton
│   ├── email.tsx              # Email service config
│   ├── email/                 # Email services
│   │   ├── email-service.ts   # Main email service
│   │   ├── email-retry.service.ts # Retry with exponential backoff
│   │   ├── email-strategy.ts  # Email provider interface
│   │   ├── email-service.factory.ts # Strategy factory
│   │   └── strategies/        # Email provider implementations
│   │       ├── gmail-smtp.strategy.ts
│   │       └── mock-email.strategy.ts
│   ├── utils.ts              # Utility functions
│   ├── types.ts              # TypeScript types
│   └── exceptions/           # Custom exceptions
│
├── contexts/                   # React contexts
│   └── auth-context.tsx       # Authentication state
│
├── hooks/                      # Custom React hooks
│   └── useUser.ts             # User operations hook
│
├── prisma/                     # Database
│   └── schema.prisma          # Database schema
│
├── messages/                   # i18n translations
│   ├── en.json               # English
│   └── pt.json               # Portuguese
│
├── i18n/                       # i18n configuration
│   └── routing.ts            # Locale routing
│
├── public/                     # Static assets
│
└── docs/                       # Documentation
    ├── README.md
    ├── event-creation.md
    ├── event-invitation.md
    ├── availability-submission.md
    ├── availability-heatmap.md
    ├── best-time-slots.md
    ├── event-finalization.md
    ├── rsvp.md
    ├── authentication.md
    ├── dashboard.md
    ├── database-schema.md
    ├── api-endpoints.md
    └── project-structure.md
```

## Architecture Pattern

This project follows **Domain-Driven Design (DDD)** principles:

1. **Modules** (`modules/`) - Domain logic separated by business capability
2. **Use Cases** - Business operations that orchestrate repositories
3. **Repositories** - Data access abstraction
4. **Interfaces** - Contract definitions for dependency injection

## Tech Stack

| Category | Technology |
|----------|-------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL + Prisma |
| Auth | Custom session tokens |
| Email | Resend |
| i18n | next-intl |
| Testing | Vitest |