import {
    CreateNotificationDto,
    Notification,
    CursorPaginationOptions,
    PaginatedNotifications
} from '../types/notification.types';

export interface INotificationRepository {
    create(dto: CreateNotificationDto): Promise<Notification>;
    createBatch(notifications: CreateNotificationDto[]): Promise<void>;
    getByUserId(userId: string, options: CursorPaginationOptions): Promise<PaginatedNotifications>;
    getUnreadCount(userId: string): Promise<number>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    delete(notificationId: string, userId: string): Promise<void>;
}
