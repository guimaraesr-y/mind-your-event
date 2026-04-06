# Date/Time Validation - Inline Validation for Start < End

## Overview

The current event creation and editing forms allow users to select invalid date ranges where the end date or end time precedes the start date or start time. This creates a poor user experience as the error is only discovered later during event processing or when participants attempt to submit availability. Implementing inline validation with clear error messages will prevent users from making these mistakes and provide immediate feedback.

## Technical Approach

The validation should be implemented at both the client-side and server-side levels for defense in depth:

1. **Client-side**: Add Zod refinement in CreateEventForm component that validates start date is before end date, and similarly for time values when both are provided
2. **Server-side**: Add validation in CreateEventUseCase and UpdateEventUseCase to prevent API-level violations

The validation should handle both date-only comparisons and datetime comparisons when time values are provided.

## Files to Modify

- components/create-event-form.tsx - Add Zod refinement for date/time validation in the form schema
- components/event-dashboard.tsx - Apply similar validation if the event editing component is different
- modules/events/use-cases/createEventUseCase.ts - Add server-side validation for date ranges
- modules/events/use-cases/updateEventUseCase.ts - Add server-side validation for date range updates
- Internationalization files - Add validation error messages to translation files

## Implementation Steps

1. Add Zod Refinement - Modify the Zod schema in components/create-event-form.tsx to include a refinement that validates start date is before end date
2. Add Time Validation - Add refinement for time values when both startTime and endTime are provided
3. Display Inline Errors - Ensure validation messages are displayed inline beneath the relevant form fields
4. Server-Side Validation - Add validation in CreateEventUseCase and UpdateEventUseCase
5. Add Translations - Add validation error messages to translation files

## Dependencies

No blocking dependencies - Can be implemented independently.

## Testing

- Validation prevents submission when end date is before start date
- Validation prevents submission when end time is before start time (when both times are provided)
- Inline error messages display correctly
- Server-side validation rejects invalid date ranges
- Both date-only and datetime comparisons work correctly
