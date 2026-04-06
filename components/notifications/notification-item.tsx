"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NotificationItem,
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  formatNotificationTime,
} from "@/types/notifications";

interface NotificationItemComponentProps {
  notification: NotificationItem;
  onClick: (notification: NotificationItem) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function NotificationItemComponent({
  notification,
  onClick,
  onDelete,
  compact = false,
}: NotificationItemComponentProps) {
  const Icon = NOTIFICATION_ICONS[notification.type];
  const colorClass = NOTIFICATION_COLORS[notification.type];

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 cursor-pointer",
        "transition-colors duration-150",
        "hover:bg-muted/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !notification.isRead && "bg-muted/30",
        compact ? "p-2" : "p-3"
      )}
      onClick={() => onClick(notification)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(notification);
        }
      }}
      aria-label={`Notification: ${notification.title}`}
    >
      <div className={cn("mt-0.5 shrink-0", colorClass)}>
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm truncate pr-6",
            !notification.isRead && "font-semibold"
          )}
        >
          {notification.title}
        </p>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNotificationTime(notification.createdAt)}
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        className={cn(
          "absolute top-3 right-3 p-1 rounded-md opacity-0 group-hover:opacity-100",
          "text-muted-foreground hover:text-foreground hover:bg-muted",
          "focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          "transition-opacity duration-150"
        )}
        aria-label={`Delete ${notification.title} notification`}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}