# MindYourEvent Documentation

Welcome to the MindYourEvent documentation. This application helps small teams schedule events by finding the best time that works for everyone.

## Features

| Feature | Description | File |
|---------|-------------|------|
| [Event Creation](./event-creation.md) | Create events with date/time ranges | `createEventUseCase.ts` |
| [Event Invitation](./event-invitation.md) | Invite participants via email | `sendEventInviteEmail.ts` |
| [Availability Submission](./availability-submission.md) | Participants submit their availability | `addUserAvailabilityUseCase.ts` |
| [Availability Heatmap](./availability-heatmap.md) | Visual display of participant availability | `availability-heatmap.tsx` |
| [Best Time Slots](./best-time-slots.md) | Algorithm for finding optimal time slots | `calculateBestSlotsUseCase.ts` |
| [Event Finalization](./event-finalization.md) | Finalize event with chosen date/time | `finalizeEventUseCase.ts` |
| [RSVP](./rsvp.md) | Confirm attendance after finalization | `SaveRsvpUseCase.ts` |
| [Authentication](./authentication.md) | Email-based passwordless authentication | API routes |
| [Dashboard](./dashboard.md) | User's events overview | `dashboard/page.tsx` |
| [Notifications](./notifications.md) | In-app notification system | `modules/notifications/` |

## Architecture

| Topic | Description | File |
|-------|-------------|------|
| [Project Structure](./project-structure.md) | Full directory structure | - |
| [Database Schema](./database-schema.md) | Prisma models | `prisma/schema.prisma` |
| [API Endpoints](./api-endpoints.md) | REST API reference | `app/api/` |

## Quick Start

1. **Clone & install**: `npm install`
2. **Environment**: Copy `.env.example` to `.env` and fill in variables
3. **Database**: Run `npx prisma generate` and `npx prisma db push`
4. **Run**: `npm run dev`

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL + Prisma
- Resend (email)
- next-intl (i18n)