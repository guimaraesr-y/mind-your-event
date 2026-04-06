"use client";

import { useTranslations } from "next-intl";
import { BellOff } from "lucide-react";

export function NotificationEmpty() {
  const t = useTranslations("Notifications");

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="text-muted-foreground mb-3">
        <BellOff className="h-12 w-12 mx-auto opacity-50" />
      </div>
      <p className="text-sm font-medium text-foreground">{t("noNotifications")}</p>
      <p className="text-xs text-muted-foreground mt-1">
        {t("allCaughtUp")}
      </p>
    </div>
  );
}