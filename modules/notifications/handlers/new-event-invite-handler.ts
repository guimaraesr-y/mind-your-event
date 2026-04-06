import { eventBus, DomainEventType, NewEventInviteEvent } from '@/lib/events';
import { INotificationService } from '../interfaces/notification-service.interface';

export class NewEventInviteHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.NEW_EVENT_INVITE,
            this.handle.bind(this)
        );
    }

    async handle(event: NewEventInviteEvent): Promise<void> {
        try {
            await this.notificationService.notifyNewEventInvite(
                event.payload.userId,
                event.payload.eventId,
                event.payload.eventTitle,
                event.payload.organizerName
            );
        } catch (error) {
            console.error('Failed to send new event invite notification:', error);
        }
    }
}