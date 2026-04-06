export enum NotificationType {
    AVAILABILITY_SUBMITTED = 'AVAILABILITY_SUBMITTED',
    EVENT_FINALIZED = 'EVENT_FINALIZED',
    RSVP_SUBMITTED = 'RSVP_SUBMITTED',
    PRODUCT_ANNOUNCEMENT = 'PRODUCT_ANNOUNCEMENT',
    SYSTEM_UPDATE = 'SYSTEM_UPDATE',
    USER_ONBOARDING = 'USER_ONBOARDING',
    JOIN_EVENT_CONFIRMATION = 'JOIN_EVENT_CONFIRMATION',
    NEW_EVENT_INVITE = 'NEW_EVENT_INVITE'
}

export interface NotificationData {
    eventId?: string;
    eventTitle?: string;
    participantName?: string;
    link?: string;
    organizerName?: string;
    willAttend?: boolean;
    [key: string]: string | boolean | undefined;
}

export interface Notification {
    id: string;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data: NotificationData | null;
    isRead: boolean;
    createdAt: Date;
}

export interface CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: NotificationData;
}

export interface CursorPaginationOptions {
    cursor?: string;
    limit: number;
    includeRead: boolean;
}

export interface PaginatedNotifications {
    items: Notification[];
    nextCursor: string | null;
    hasMore: boolean;
}