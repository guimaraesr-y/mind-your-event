import prisma from '@/lib/db';
import { INotificationRepository } from '../interfaces/notification-repository.interface';
import { 
    CreateNotificationDto, 
    Notification, 
    CursorPaginationOptions, 
    PaginatedNotifications 
} from '../types/notification.types';

export class NotificationRepository implements INotificationRepository {
    async create(dto: CreateNotificationDto): Promise<Notification> {
        const notification = await prisma.notification.create({
            data: {
                user_id: dto.userId,
                type: dto.type,
                title: dto.title,
                message: dto.message,
                data: dto.data || undefined,
                is_read: false,
            }
        });

        return this.mapToNotification(notification);
    }

    async createBatch(notifications: CreateNotificationDto[]): Promise<void> {
        await prisma.$transaction(
            notifications.map(dto => 
                prisma.notification.create({
                    data: {
                        user_id: dto.userId,
                        type: dto.type,
                        title: dto.title,
                        message: dto.message,
                        data: dto.data || undefined,
                        is_read: false,
                    }
                })
            )
        );
    }

    async getByUserId(userId: string, options: CursorPaginationOptions): Promise<PaginatedNotifications> {
        const { cursor, limit, includeRead } = options;

        const whereClause: any = {
            user_id: userId,
        };

        if (!includeRead) {
            whereClause.is_read = false;
        }

        if (cursor) {
            whereClause.created_at = {
                lt: new Date(cursor),
            };
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            take: limit + 1,
        });

        const hasMore = notifications.length > limit;
        const items = hasMore ? notifications.slice(0, -1) : notifications;
        const nextCursor = hasMore ? items[items.length - 1]?.created_at.toISOString() : null;

        return {
            items: items.map(this.mapToNotification),
            nextCursor,
            hasMore,
        };
    }

    async getUnreadCount(userId: string): Promise<number> {
        return prisma.notification.count({
            where: {
                user_id: userId,
                is_read: false,
            }
        });
    }

    async markAsRead(notificationId: string, userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                id: notificationId,
                user_id: userId,
            },
            data: {
                is_read: true,
            }
        });
    }

    async markAllAsRead(userId: string): Promise<void> {
        await prisma.notification.updateMany({
            where: {
                user_id: userId,
                is_read: false,
            },
            data: {
                is_read: true,
            }
        });
    }

    async delete(notificationId: string, userId: string): Promise<void> {
        await prisma.notification.deleteMany({
            where: {
                id: notificationId,
                user_id: userId,
            }
        });
    }

    private mapToNotification(notification: any): Notification {
        return {
            id: notification.id,
            userId: notification.user_id,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            isRead: notification.is_read,
            createdAt: notification.created_at,
        };
    }
}