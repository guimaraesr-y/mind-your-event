"use client";

import { BellOff } from "lucide-react";

export function NotificationEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-muted-foreground mb-3">
        <BellOff className="h-12 w-12 mx-auto opacity-50" />
      </div>
      <p className="text-sm font-medium text-foreground">No notifications</p>
      <p className="text-xs text-muted-foreground mt-1">
        You&apos;re all caught up!
      </p>
    </div>
  );
}