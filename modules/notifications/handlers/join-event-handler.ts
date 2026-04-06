import { eventBus, DomainEventType, JoinEventEvent } from '@/lib/events';
import { INotificationService } from '../interfaces/notification-service.interface';

export class JoinEventHandler {
    constructor(private notificationService: INotificationService) {
        eventBus.subscribe(
            DomainEventType.JOIN_EVENT,
            this.handle.bind(this)
        );
    }

    async handle(event: JoinEventEvent): Promise<void> {
        try {
            await this.notificationService.notifyJoinEvent(
                event.payload.userId,
                event.payload.eventId,
                event.payload.eventTitle
            );
        } catch (error) {
            console.error('Failed to send join event notification:', error);
        }
    }
}