import { eventBus, DomainEventType, EventFinalizedEvent } from '@/lib/events';
import { INotificationService } from '../interfaces/notification-service.interface';

export class EventFinalizedHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.EVENT_FINALIZED,
            this.handle.bind(this)
        );
    }

    async handle(event: EventFinalizedEvent): Promise<void> {
        try {
            await this.notificationService.notifyEventFinalized(
                event.payload.eventId,
                event.payload.eventTitle,
                event.payload.participantIds
            );
        } catch (error) {
            console.error('Failed to send event finalized notification:', error);
        }
    }
}