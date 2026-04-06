import { INotificationService } from '../interfaces/notification-service.interface';
import { INotificationRepository } from '../interfaces/notification-repository.interface';
import { 
    NotificationType, 
    NotificationData, 
    CreateNotificationDto 
} from '../types/notification.types';

export class NotificationService implements INotificationService {
    constructor(private repository: INotificationRepository) {}

    async notifyAvailabilitySubmitted(
        organizerId: string, 
        eventId: string, 
        eventTitle: string, 
        participantName: string
    ): Promise<void> {
        await this.repository.create({
            userId: organizerId,
            type: NotificationType.AVAILABILITY_SUBMITTED,
            title: 'Availability Submitted',
            message: `${participantName} has submitted their availability for "${eventTitle}"`,
            data: {
                eventId,
                eventTitle,
                participantName,
            }
        });
    }

    async notifyEventFinalized(eventId: string, eventTitle: string, participantIds?: string[]): Promise<void> {
        if (participantIds && participantIds.length > 0) {
            const notifications: CreateNotificationDto[] = participantIds.map(userId => ({
                userId,
                type: NotificationType.EVENT_FINALIZED,
                title: 'Event Finalized',
                message: `The event "${eventTitle}" has been finalized`,
                data: {
                    eventId,
                    eventTitle,
                }
            }));
            await this.repository.createBatch(notifications);
        }
    }

    async notifyRsvpSubmitted(
        organizerId: string, 
        eventId: string, 
        eventTitle: string, 
        participantName: string, 
        willAttend: boolean
    ): Promise<void> {
        await this.repository.create({
            userId: organizerId,
            type: NotificationType.RSVP_SUBMITTED,
            title: willAttend ? 'Participant Attending' : 'Participant Declined',
            message: `${participantName} has ${willAttend ? 'confirmed' : 'declined'} their attendance for "${eventTitle}"`,
            data: {
                eventId,
                eventTitle,
                participantName,
                willAttend,
            }
        });
    }

    async notifyJoinEvent(userId: string, eventId: string, eventTitle: string): Promise<void> {
        await this.repository.create({
            userId,
            type: NotificationType.JOIN_EVENT_CONFIRMATION,
            title: 'Event Joined',
            message: `You have successfully joined "${eventTitle}"`,
            data: {
                eventId,
                eventTitle,
            }
        });
    }

    async notifyNewEventInvite(userId: string, eventId: string, eventTitle: string, organizerName: string): Promise<void> {
        await this.repository.create({
            userId,
            type: NotificationType.NEW_EVENT_INVITE,
            title: 'New Event Invitation',
            message: `${organizerName} invited you to "${eventTitle}"`,
            data: {
                eventId,
                eventTitle,
                organizerName,
                link: `/invite/${eventId}`,
            }
        });
    }

    async notifyAllUsers(
        type: NotificationType.PRODUCT_ANNOUNCEMENT | NotificationType.SYSTEM_UPDATE, 
        title: string, 
        message: string
    ): Promise<void> {
        // This would require fetching all users - implemented as admin endpoint later
    }
}