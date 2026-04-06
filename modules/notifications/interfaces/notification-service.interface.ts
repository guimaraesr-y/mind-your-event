import { NotificationType, NotificationData } from '../types/notification.types';

export interface INotificationService {
    notifyAvailabilitySubmitted(organizerId: string, eventId: string, eventTitle: string, participantName: string): Promise<void>;
    notifyEventFinalized(eventId: string, eventTitle: string, participantIds?: string[]): Promise<void>;
    notifyRsvpSubmitted(organizerId: string, eventId: string, eventTitle: string, participantName: string, willAttend: boolean): Promise<void>;
    notifyJoinEvent(userId: string, eventId: string, eventTitle: string): Promise<void>;
    notifyNewEventInvite(userId: string, eventId: string, eventTitle: string, organizerName: string): Promise<void>;
    notifyAllUsers(type: NotificationType.PRODUCT_ANNOUNCEMENT | NotificationType.SYSTEM_UPDATE, title: string, message: string): Promise<void>;
}