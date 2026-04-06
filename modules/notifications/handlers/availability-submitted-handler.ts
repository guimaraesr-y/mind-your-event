import { eventBus, DomainEventType, AvailabilitySubmittedEvent } from '@/lib/events';
import { INotificationService } from '../interfaces/notification-service.interface';

export class AvailabilitySubmittedHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.AVAILABILITY_SUBMITTED,
            this.handle.bind(this)
        );
    }

    async handle(event: AvailabilitySubmittedEvent): Promise<void> {
        try {
            await this.notificationService.notifyAvailabilitySubmitted(
                event.payload.organizerId,
                event.payload.eventId,
                event.payload.eventTitle,
                event.payload.participantName
            );
        } catch (error) {
            console.error('Failed to send availability notification:', error);
        }
    }
}