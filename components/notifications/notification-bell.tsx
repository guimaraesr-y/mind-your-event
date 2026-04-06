"use client";

import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  unreadCount: number;
  onClick: () => void;
  isOpen: boolean;
}

export function NotificationBell({
  unreadCount,
  onClick,
  isOpen,
}: NotificationBellProps) {
  const displayCount = unreadCount > 9 ? "9+" : unreadCount;

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative p-2 rounded-md transition-colors",
        "hover:bg-accent hover:text-accent-foreground",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "text-muted-foreground"
      )}
      aria-label={`Notifications, ${unreadCount} unread`}
      aria-expanded={isOpen}
    >
      <Bell className="h-5 w-5" />
      {unreadCount > 0 && (
        <span
          className={cn(
            "absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center",
            "text-[10px] font-bold text-white bg-red-500 rounded-full px-1",
            "animate-in zoom-in duration-200"
          )}
        >
          {displayCount}
        </span>
      )}
    </button>
  );
}