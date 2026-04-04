# Best Time Slots

Algorithm that calculates optimal time slots based on participant availability overlap.

## Use Case: `CalculateBestSlotsUseCase`

**File:** `modules/events/use-cases/calculateBestSlotsUseCase.ts`

## Algorithm Overview

1. Collect all availability slots from participants
2. For each slot, identify overlapping times
3. Count participants per time slot
4. Sort by highest overlap (most participants available)
5. Return top 5 best slots

## Key Classes

### TimeSlot

```typescript
class TimeSlot {
  constructor(
    private readonly date: string,
    private readonly startTime: string,
    private readonly endTime: string
  ) {}
}
```

### OverlappingSlot

```typescript
class OverlappingSlot {
  private count: number = 0;
  private participants: string[] = [];

  addParticipant(name: string): void;
  getCount(): number;
  getPercentage(): number;
  toJSON(): OverlappingSlotData;
}
```

### OverlappingSlotCollection

```typescript
class OverlappingSlotCollection {
  addSlot(timeSlot: TimeSlot, participantName: string): void;
  getBest(limit: number): OverlappingSlotData[];
}
```

## Output Format

```typescript
interface OverlappingSlotData {
  date: string;
  startTime: string;
  endTime: string;
  count: number;           // Number of participants
  percentage: number;      // % of participants available
  participants: string[];  // Names of available participants
}
```

## Sorting Priority

1. Highest participant count (descending)
2. Earliest date
3. Earliest start time

## Example Output

```json
[
  {
    "date": "2024-01-15",
    "startTime": "14:00",
    "endTime": "16:00",
    "count": 4,
    "percentage": 80,
    "participants": ["Alice", "Bob", "Charlie", "David"]
  },
  {
    "date": "2024-01-16",
    "startTime": "10:00",
    "endTime": "12:00",
    "count": 3,
    "percentage": 60,
    "participants": ["Alice", "Bob", "Eve"]
  }
]
```

## Key Files

| File | Purpose |
|------|---------|
| `modules/events/use-cases/calculateBestSlotsUseCase.ts` | Algorithm |
| `modules/events/services/event-metrics.service.ts` | Metrics calculation |
| `app/[locale]/events/[eventId]/results/page.tsx` | Results display |

## Notes

- Returns maximum of 5 best slots
- Only considers slots where at least 1 participant is available
- Requires at least 2 participants for meaningful results