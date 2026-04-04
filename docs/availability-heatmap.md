# Availability Heatmap

Visual display showing how many participants are available on each date.

## Component: `AvailabilityHeatmap`

**File:** `components/availability-heatmap.tsx`

## Visual Representation

```
┌─────────────────────────────────────────────────────────┐
│ Date          │ Availability Bar                        │
├─────────────────────────────────────────────────────────┤
│ Mon, Jan 15   │ ████████████████░░ 5/5 (100%)           │
│ Tue, Jan 16   │ ████████████░░░░░░ 4/5 (80%)            │
│ Wed, Jan 17   │ ██████░░░░░░░░░░░░ 3/5 (60%)            │
│ Thu, Jan 18   │ ██████░░░░░░░░░░░░ 3/5 (60%)            │
│ Fri, Jan 19   │ ████░░░░░░░░░░░░░░ 2/5 (40%)            │
└─────────────────────────────────────────────────────────┘
```

## Color Coding

| Percentage | Color | Description |
|------------|-------|-------------|
| ≥75% | Primary (green) | High availability |
| ≥50% | Accent (yellow) | Medium availability |
| ≥25% | Chart-4 (orange) | Low availability |
| >0% | Muted (gray) | Very low |
| 0% | Muted/30 | No availability |

## Props

```typescript
interface AvailabilityHeatmapProps {
  event: Event;
  dateAvailability: Map<string, number>;  // date -> count
  totalParticipants: number;
}
```

## Data Preparation

1. Fetch all availability slots for event
2. Group by date
3. Count unique users per date
4. Calculate percentage vs total participants

## Key Files

| File | Purpose |
|------|---------|
| `components/availability-heatmap.tsx` | Heatmap component |
| `app/[locale]/events/[eventId]/results/page.tsx` | Results page |

## Notes

- Only shows date-level aggregation (not time slots)
- See [Best Time Slots](./best-time-slots.md) for time-level analysis