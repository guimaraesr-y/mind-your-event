import { NotificationRepository } from './repository/notification-repository';
import { NotificationService } from './services/notification-service';
import { AvailabilitySubmittedHandler } from './handlers/availability-submitted-handler';
import { EventFinalizedHandler } from './handlers/event-finalized-handler';
import { RsvpSubmittedHandler } from './handlers/rsvp-submitted-handler';
import { JoinEventHandler } from './handlers/join-event-handler';
import { NewEventInviteHandler } from './handlers/new-event-invite-handler';

const repository = new NotificationRepository();
const notificationService = new NotificationService(repository);

export function registerNotificationHandlers(): void {
    new AvailabilitySubmittedHandler(notificationService);
    new EventFinalizedHandler(notificationService);
    new RsvpSubmittedHandler(notificationService);
    new JoinEventHandler(notificationService);
    new NewEventInviteHandler(notificationService);
}

export { notificationService, NotificationRepository, NotificationService };
export * from './types/notification.types';
export * from './interfaces/notification-repository.interface';
export * from './interfaces/notification-service.interface';