"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NotificationItemComponent } from "./notification-item";
import { NotificationEmpty } from "./notification-empty";
import {
  NotificationItem,
  groupNotificationsByDate,
} from "@/types/notifications";

interface NotificationListProps {
  notifications: NotificationItem[];
  isLoading: boolean;
  onMarkAsRead: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onMarkAllAsRead: () => Promise<void>;
  unreadCount: number;
  compact?: boolean;
}

export function NotificationList({
  notifications,
  isLoading,
  onMarkAsRead,
  onDelete,
  onMarkAllAsRead,
  unreadCount,
  compact = false,
}: NotificationListProps) {
  const router = useRouter();
  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);

  const grouped = groupNotificationsByDate(notifications);
  const hasNotifications = notifications.length > 0;

  const handleNotificationClick = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.isRead) {
        await onMarkAsRead(notification.id);
      }

      if (notification.eventId) {
        router.push(`/event/${notification.eventId}`);
      }
    },
    [onMarkAsRead, router]
  );

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllRead(true);
    try {
      await onMarkAllAsRead();
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const renderGroup = (label: string, items: NotificationItem[]) => {
    if (items.length === 0) return null;

    return (
      <div key={label} className="mb-4 last:mb-0">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2 sticky top-0 bg-background z-10">
          {label}
        </h3>
        <div className="space-y-0.5">
          {items.map((notification) => (
            <NotificationItemComponent
              key={notification.id}
              notification={notification}
              onClick={handleNotificationClick}
              onDelete={onDelete}
              compact={compact}
            />
          ))}
        </div>
      </div>
    );
  };

  if (isLoading && !hasNotifications) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasNotifications) {
    return <NotificationEmpty />;
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0">
        <span className="text-sm font-medium">
          {unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
            : "All caught up"}
        </span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAllRead}
          >
            {isMarkingAllRead ? (
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Check className="h-3 w-3 mr-1" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderGroup("Today", grouped.today)}
        {renderGroup("Yesterday", grouped.yesterday)}
        {renderGroup("Earlier", grouped.earlier)}
      </div>
    </div>
  );
}