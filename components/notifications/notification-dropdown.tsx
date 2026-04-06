"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./notification-bell";
import { NotificationList } from "./notification-list";
import {
  useNotifications,
  useUnreadCount,
} from "@/hooks/use-notifications";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useMediaQuery } from "@/hooks/useMediaQuery";

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { unreadCount, isLoading: isLoadingCount, refresh: refreshCount } =
    useUnreadCount();
  const {
    notifications,
    isLoading: isLoadingNotifications,
    refresh: refreshNotifications,
  } = useNotifications();

  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !isMobile) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, handleClickOutside, handleEscape, isMobile]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const markAsRead = async (id: string) => {
    setIsMarkingAsRead(true);
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      await refreshNotifications();
      await refreshCount();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllRead" }),
      });
      await refreshNotifications();
      await refreshCount();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const deleteNotification = async (id: string) => {
    setIsDeleting(id);
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      });
      await refreshNotifications();
      await refreshCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    } finally {
      setIsDeleting(null);
    }
  };

  if (isMobile) {
    return (
      <div ref={dropdownRef}>
        <NotificationBell
          unreadCount={unreadCount}
          onClick={toggleDropdown}
          isOpen={isOpen}
        />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-md max-h-[80vh] flex flex-col p-0 gap-0">
            <DialogHeader className="px-4 py-3 border-b shrink-0">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-sm font-semibold">
                  Notifications
                </DialogTitle>
              </div>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto">
              <NotificationList
                notifications={notifications}
                isLoading={isLoadingNotifications || isLoadingCount}
                onMarkAsRead={markAsRead}
                onDelete={deleteNotification}
                onMarkAllAsRead={markAllAsRead}
                unreadCount={unreadCount}
                compact
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <NotificationBell
        unreadCount={unreadCount}
        onClick={toggleDropdown}
        isOpen={isOpen}
      />

      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 bg-background border rounded-lg shadow-lg",
            "w-96 max-h-[24rem] flex flex-col overflow-hidden",
            "animate-in fade-in zoom-in-95 duration-200",
            "z-50"
          )}
          role="dialog"
          aria-modal="true"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between px-4 py-3 border-b shrink-0">
            <h2 className="text-sm font-semibold">Notifications</h2>
            <button
              onClick={closeDropdown}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close notifications"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <NotificationList
            notifications={notifications}
            isLoading={isLoadingNotifications || isLoadingCount}
            onMarkAsRead={markAsRead}
            onDelete={deleteNotification}
            onMarkAllAsRead={markAllAsRead}
            unreadCount={unreadCount}
          />
        </div>
      )}
    </div>
  );
}
