# Prominent Finalize Event Button

## Overview

Currently, the functionality to finalize an event (confirming the final date and time based on participant availability) is buried in the results page, accessible only after navigating through multiple screens. Organizers who want to finalize their event must remember this workflow, which is not intuitive. Making the Finalize Event action accessible directly from the dashboard will improve discoverability and streamline the event completion workflow.

## Technical Approach

The implementation requires adding a visible action button or menu option to the event cards displayed in the dashboard:

1. Add a prominent button to event cards in the dashboard
2. The button should only appear for events that have not yet been finalized and that have received at least some availability submissions
3. For events with no submissions, the button should be disabled with a tooltip explaining why
4. Leverage the existing ConfirmEventDialog component that is already used in the results page

## Files to Modify

- components/event-card.tsx - Add finalize button to event cards in the dashboard
- components/created-events.tsx - Ensure the button is properly integrated into the created events list
- components/finalize-event-dialog.tsx - Verify the component works correctly when opened from the dashboard
- app/[locale]/dashboard/page.tsx - May need modification depending on how the button is integrated

## Implementation Steps

1. Add Finalize Button - Add a button to event-card.tsx that appears for unfinalized events
2. Handle Disabled State - Add logic to disable the button when no availability has been submitted
3. Integrate Dialog - Ensure the existing ConfirmEventDialog works when triggered from the dashboard
4. Add Tooltip - Add tooltip explaining why button is disabled when no submissions exist
5. Test Navigation - Verify the user is navigated to the results page or dialog opens correctly

## Dependencies

This improvement depends on the existing finalize event functionality being fully working (ConfirmEventDialog component).

## Testing

- Finalize button appears on unfinalized events in dashboard
- Button is disabled when no availability has been submitted
- Button opens the finalize dialog or navigates to results page
- Tooltip displays correct message when button is disabled
- Works correctly with existing ConfirmEventDialog
