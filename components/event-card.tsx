"use client";

import { ArrowRight, Calendar, User, Users } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import React from "react";
import { useLocale, useTranslations } from "next-intl";

interface EventCardProps {
    title: string;
    startDate: string;
    endDate: string;
    participantsCount: number;
    organizerName?: string;
    statusIcon?: React.ReactNode;
    linkHref: string;
    linkTextKey: "viewDetails" | "viewInvitation";
}

export function EventCard({
    title,
    startDate,
    endDate,
    participantsCount,
    organizerName,
    statusIcon,
    linkHref,
    linkTextKey,
}: EventCardProps) {
    const t = useTranslations("EventCard");
    const locale = useLocale();

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString(locale, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-5 rounded-xl border bg-card gap-4 interactive-card-hover group">
            <div className="space-y-3 flex-1 min-w-0">
                <div className="flex items-start gap-3">
                    {statusIcon && <div className="mt-1 shrink-0">{statusIcon}</div>}
                    <div className="space-y-1 min-w-0">
                        <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
                            {title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <Calendar className="h-4 w-4 text-primary/70" />
                                <span>
                                    {formatDate(startDate)} - {formatDate(endDate)}
                                </span>
                            </div>
                            {organizerName && (
                                <div className="flex items-center gap-1.5 truncate">
                                    <User className="h-4 w-4 text-primary/70" />
                                    <span className="truncate">{t("organizedBy", { name: organizerName })}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 whitespace-nowrap">
                                <Users className="h-4 w-4 text-primary/70" />
                                <span>{t("participants", { count: participantsCount })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Link href={linkHref}>
                    {t(linkTextKey)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
