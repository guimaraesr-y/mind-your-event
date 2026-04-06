# Notification UI Implementation Plan

> **Status**: Pending Implementation (Phase 6 of Notification System)
> **Depends on**: Task 00 - In-App Notification System (Backend)

---

## 1. Executive Summary

This plan outlines the implementation of a responsive, modern notification UI for the MindYourEvent application. The system will feature a notification bell with badge in the header, a dropdown panel for viewing notifications, and seamless integration with the existing notification backend.

---

## 2. Current State Analysis

### Backend (Implemented - Task 00)
- ✅ API endpoints: `/api/notifications`, `/api/notifications/unread-count`, `/api/notifications/:id`
- ✅ Domain events pattern for triggering notifications
- ✅ Notification types: AVAILABILITY_SUBMITTED, EVENT_FINALIZED, RSVP_SUBMITTED, JOIN_EVENT_CONFIRMATION, NEW_EVENT_INVITE, PRODUCT_ANNOUNCEMENT, SYSTEM_UPDATE, USER_ONBOARDING

### Frontend (Not Implemented)
- ❌ NotificationBell component (badge + bell icon)
- ❌ NotificationDropdown/Panel component
- ❌ Integration with header
- ❌ Real-time updates (polling/SWR)

### Existing UI Components
- Header: Located at `components/header.tsx`, uses sticky positioning with backdrop blur
- Current header items: Logo, LanguageSwitcher, Info (tutorial trigger)
- UI library: shadcn/ui components available (Button, Dropdown, Badge, Card, Dialog)

---

## 3. Requirements Analysis

### Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| F1 | Display notification bell in header with unread count badge | P0 |
| F2 | Click bell to open dropdown panel | P0 |
| F3 | Display list of notifications with title, message, timestamp | P0 |
| F4 | Visual distinction between read/unread notifications | P0 |
| F5 | Click notification to navigate to relevant event | P1 |
| F6 | Mark single notification as read on click | P1 |
| F7 | "Mark all as read" button in dropdown | P1 |
| F8 | Delete notification option | P2 |
| F9 | Group notifications by date (Today, Yesterday, Earlier) | P2 |
| F10 | Empty state when no notifications | P1 |

### Non-Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| NF1 | Mobile responsive - dropdown adapts to screen size | P0 |
| NF2 | Fast loading - badge updates without page refresh | P0 |
| NF3 | Smooth animations for badge and dropdown | P1 |
| NF4 | Accessible - keyboard navigation, ARIA labels | P1 |
| NF5 | Polling for new notifications (30s interval) | P1 |

---

## 4. Design Patterns & Architecture

### Component Structure

```
components/notifications/
├── notification-bell.tsx        # Bell icon + badge (unread count)
├── notification-dropdown.tsx    # Dropdown panel container
├── notification-list.tsx       # Scrollable list of items
├── notification-item.tsx        # Single notification row
├── notification-empty.tsx      # Empty state component
└── index.ts                     # Barrel exports

# Hooks
hooks/
└── use-notifications.ts        # SWR hooks for fetching data

# Types
types/
└── notifications/
    └── index.ts                # Frontend notification types
```

### Data Fetching Strategy

- **SWR (Stale-While-Revalidate)** for caching and background refetch
- **Polling**: Fetch unread count every 30 seconds
- **Optimistic Updates**: Mark as read immediately, revert on failure

---

## 5. UI/UX Design Guidelines

### Visual Design

**Color Palette:**
- Badge: `bg-red-500` (unread indicator)
- Unread background: `bg-muted/50` (subtle highlight)
- Read: Default transparent background
- Hover: `hover:bg-muted` transition

**Typography:**
- Unread title: `font-semibold`
- Read title: `font-normal`
- Message: `text-sm text-muted-foreground`
- Timestamp: `text-xs text-muted-foreground`

### Layout Specifications

**Bell Position in Header:**
- Right side, before LanguageSwitcher
- Icon size: `h-5 w-5`
- Badge: Small red circle, max display "9+" for count > 9

**Dropdown Panel:**
- Position: Absolute, anchored to bell
- Width: `w-80` (desktop), `w-[calc(100vw-2rem)]` (mobile)
- Max-height: `max-h-96` with overflow scroll
- Shadow: `shadow-lg`
- Animation: Fade in + slide down

### Icon Mapping by Notification Type

| Type | Icon (Lucide) |
|------|---------------|
| AVAILABILITY_SUBMITTED | `CalendarCheck` |
| EVENT_FINALIZED | `CalendarCheck` |
| RSVP_SUBMITTED | `CheckCircle` or `XCircle` |
| JOIN_EVENT_CONFIRMATION | `UserPlus` |
| NEW_EVENT_INVITE | `Mail` |
| PRODUCT_ANNOUNCEMENT | `Sparkles` |
| SYSTEM_UPDATE | `Info` |
| USER_ONBOARDING | `GraduationCap` |

### Responsive Breakpoints

**Desktop (> 768px):**
- Dropdown width: `w-80` (320px)
- Position: Right-aligned from bell

**Mobile (< 768px):**
- Dropdown width: `w-[calc(100vw-2rem)]`
- Centered
- Simplified content (truncate message)

### Date Grouping

```
Today
├── [Notification 1] - 10:30 AM
└── [Notification 2] - 2:15 PM

Yesterday
└── [Notification 3] - 4:00 PM

Earlier
└── [Notification 4] - Mar 30
```

---

## 6. Technical Implementation Steps

### Step 1: Type Definitions (Priority: High)
- Create `types/notifications/index.ts` with frontend-specific types
- Include mapping for notification type to display properties (icon, color)

### Step 2: Custom Hook (Priority: High)
- Create `hooks/use-notifications.ts`
- Implement `useNotifications(cursor, limit)` hook
- Implement `useUnreadCount()` hook
- Use SWR for data fetching with auto-refresh

### Step 3: NotificationBell Component (Priority: High)
- Props: `unreadCount: number`, `onClick: () => void`
- Badge shows count (max "9+")
- Subtle bounce animation on new notification (optional)

### Step 4: NotificationDropdown Component (Priority: High)
- Props: `isOpen: boolean`, `notifications: Notification[]`, `onClose: () => void`
- Contains: header with count + "Mark all read" button, list, empty state

### Step 5: NotificationItem Component (Priority: High)
- Props: `notification: Notification`, `onClick: () => void`, `onDelete: () => void`
- Visual states: unread (bold + highlight), read (normal)
- Click: Mark as read, navigate to event

### Step 6: Header Integration (Priority: High)
- Add NotificationBell to `components/header.tsx`
- Wrap in client component with state

### Step 7: Polish & Animation (Priority: Medium)
- Add CSS transitions
- Smooth dropdown open/close

### Step 8: Accessibility (Priority: Medium)
- Keyboard navigation (Tab, Enter, Escape)
- ARIA labels for screen readers
- Focus management in dropdown

---

## 7. API Integration

### Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/notifications` | GET | Fetch notification list |
| `/api/notifications/unread-count` | GET | Fetch badge count |
| `/api/notifications/:id` | PATCH | Mark as read |
| `/api/notifications` | PATCH | Mark all as read |
| `/api/notifications/:id` | DELETE | Delete notification |

### SWR Configuration

```typescript
// Unread count - polling every 30s
const { data } = useSWR('/api/notifications/unread-count', fetcher, {
  refreshInterval: 30000,
});

// Notifications list
const { data, mutate } = useSWR(
  ['/api/notifications', cursor],
  ([url, cursor]) => fetch(`${url}?limit=20`).then(res => res.json())
);
```

---

## 8. File Structure

### New Files to Create

```
components/notifications/
├── notification-bell.tsx          # Bell icon + badge
├── notification-dropdown.tsx      # Dropdown container
├── notification-list.tsx          # Grouped list
├── notification-item.tsx          # Single item
├── notification-empty.tsx         # Empty state
└── index.ts                       # Exports

hooks/
└── use-notifications.ts           # SWR hooks

types/
└── notifications/
    └── index.ts                   # Frontend types
```

### Files to Modify

```
components/
└── header.tsx                     # Add notification bell
```

---

## 9. Dependencies

### Existing Dependencies Used
- `swr` - Data fetching
- `lucide-react` - Icons
- `shadcn/ui` - Button, Badge, ScrollArea components

---

## 10. Acceptance Criteria

### Visual Checkpoints
- [ ] Bell icon visible in header on all pages
- [ ] Badge shows correct unread count (or "9+" if > 9)
- [ ] Dropdown opens on bell click
- [ ] Notifications grouped by date
- [ ] Unread notifications have visual distinction
- [ ] Click notification marks as read and navigates
- [ ] "Mark all as read" works
- [ ] Empty state shows when no notifications
- [ ] Mobile responsive - works on small screens

### Functional Checkpoints
- [ ] Unread count updates automatically (polling)
- [ ] Clicking notification navigates to correct event
- [ ] Delete notification works
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] No console errors during normal operation

### Performance Checkpoints
- [ ] Initial page load < 100ms for badge
- [ ] Dropdown opens instantly (< 100ms)
- [ ] Smooth scrolling in notification list
- [ ] No layout shift when badge appears

---

## 11. Implementation Order

1. **Types** → Define notification display types
2. **Hooks** → Create SWR hooks
3. **Bell** → Implement badge component
4. **Item** → Single notification component
5. **List** → Grouped list component
6. **Dropdown** → Container component
7. **Empty** → Empty state component
8. **Header** → Integrate into header
9. **Polish** → Animations and edge cases

---

## Questions Clarified

| Question | Answer |
|----------|--------|
| Navigation | Same tab for better UX |
| Animation | Subtle bounce for badge when count changes |
| Mobile behavior | Close dropdown before navigating |
| Error handling | Show error toast, allow retry |
| Loading state | Show skeleton while fetching |