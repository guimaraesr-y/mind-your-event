import { NotificationType } from "@/modules/notifications/types/notification.types";
import {
  CalendarCheck,
  CheckCircle,
  UserPlus,
  Mail,
  Sparkles,
  Info,
  GraduationCap,
  XCircle,
  type LucideIcon,
} from "lucide-react";

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  eventId?: string;
  data?: Record<string, unknown>;
}

export interface PaginatedNotifications {
  items: NotificationItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export type NotificationIconType = LucideIcon;

export const NOTIFICATION_ICONS: Record<NotificationType, NotificationIconType> = {
  [NotificationType.AVAILABILITY_SUBMITTED]: CalendarCheck,
  [NotificationType.EVENT_FINALIZED]: CalendarCheck,
  [NotificationType.RSVP_SUBMITTED]: CheckCircle,
  [NotificationType.PRODUCT_ANNOUNCEMENT]: Sparkles,
  [NotificationType.SYSTEM_UPDATE]: Info,
  [NotificationType.USER_ONBOARDING]: GraduationCap,
  [NotificationType.JOIN_EVENT_CONFIRMATION]: UserPlus,
  [NotificationType.NEW_EVENT_INVITE]: Mail,
};

export const NOTIFICATION_COLORS: Record<NotificationType, string> = {
  [NotificationType.AVAILABILITY_SUBMITTED]: "text-green-500",
  [NotificationType.EVENT_FINALIZED]: "text-green-500",
  [NotificationType.RSVP_SUBMITTED]: "text-blue-500",
  [NotificationType.PRODUCT_ANNOUNCEMENT]: "text-purple-500",
  [NotificationType.SYSTEM_UPDATE]: "text-gray-500",
  [NotificationType.USER_ONBOARDING]: "text-orange-500",
  [NotificationType.JOIN_EVENT_CONFIRMATION]: "text-green-500",
  [NotificationType.NEW_EVENT_INVITE]: "text-blue-500",
};

export type DateGroup = "today" | "yesterday" | "earlier";

export interface GroupedNotifications {
  today: NotificationItem[];
  yesterday: NotificationItem[];
  earlier: NotificationItem[];
}

export function groupNotificationsByDate(
  notifications: NotificationItem[]
): GroupedNotifications {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    earlier: [],
  };

  notifications.forEach((notification) => {
    const notificationDate = new Date(notification.createdAt);
    const notificationDay = new Date(
      notificationDate.getFullYear(),
      notificationDate.getMonth(),
      notificationDate.getDate()
    );

    if (notificationDay.getTime() === today.getTime()) {
      grouped.today.push(notification);
    } else if (notificationDay.getTime() === yesterday.getTime()) {
      grouped.yesterday.push(notification);
    } else {
      grouped.earlier.push(notification);
    }
  });

  return grouped;
}

export function formatNotificationTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const notificationDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate()
  );

  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (notificationDate.getTime() === today.getTime()) {
    return time;
  } else if (notificationDate.getTime() === yesterday.getTime()) {
    return `Yesterday, ${time}`;
  } else {
    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }
}