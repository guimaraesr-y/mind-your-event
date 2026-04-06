# RSVP Context - Show Event Details Before RSVP Buttons

## Overview

Currently, the RSVP card presents attend/decline buttons without first showing the event details such as date, time, and description. Participants may not remember the event details when they receive the RSVP request, creating friction in the decision-making process. Displaying the event context before the RSVP buttons will help participants make informed decisions.

## Technical Approach

The implementation requires modifying the RsvpCard component to include the event details section before the RSVP buttons:

1. Display the event title, description (if present), date range, and preferred time window
2. Reorganize the layout to show the event information first, followed by the RSVP buttons
3. Maintain the existing visual hierarchy while adding the new information

## Files to Modify

- components/rsvp-card.tsx - Add event details section before RSVP buttons
- app/[locale]/events/[eventId]/page.tsx - Verify the event object passed to RsvpCard contains necessary details

## Implementation Steps

1. Modify RsvpCard Layout - Reorganize components/rsvp-card.tsx to display event details before buttons
2. Add Event Details - Display event title, description, date range, and time window
3. Maintain Design - Keep visual hierarchy consistent with existing design language
4. Verify Data - Ensure app/[locale]/events/[eventId]/page.tsx passes all necessary event data

## Dependencies

No blocking dependencies - Can be implemented independently.

## Testing

- Event details are displayed before RSVP buttons
- All relevant event information is shown (title, description, date, time)
- Layout is visually consistent with existing design
- Buttons remain easily accessible after viewing details
