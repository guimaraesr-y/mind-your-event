import { eventBus, DomainEventType, RsvpSubmittedEvent } from '@/lib/events';
import { INotificationService } from '../interfaces/notification-service.interface';

export class RsvpSubmittedHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.RSVP_SUBMITTED,
            this.handle.bind(this)
        );
    }

    async handle(event: RsvpSubmittedEvent): Promise<void> {
        try {
            await this.notificationService.notifyRsvpSubmitted(
                event.payload.organizerId,
                event.payload.eventId,
                event.payload.eventTitle,
                event.payload.participantName,
                event.payload.willAttend
            );
        } catch (error) {
            console.error('Failed to send RSVP notification:', error);
        }
    }
}