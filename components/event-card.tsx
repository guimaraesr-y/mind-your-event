"use client";

import { ArrowRight, Calendar, User, Users } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import React from "react";

interface EventCardProps {
    title: string;
    startDate: string;
    endDate: string;
    participantsCount: number;
    organizerName?: string;
    statusIcon?: React.ReactNode;
    linkHref: string;
    linkText: string;
}

const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export function EventCard({
    title,
    startDate,
    endDate,
    participantsCount,
    organizerName,
    statusIcon,
    linkHref,
    linkText,
}: EventCardProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border gap-4">
            <div className="space-y-2">
                <p className="font-semibold text-foreground inline-flex items-center justify-center gap-2">
                    {statusIcon}
                    {title}
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        <span>
                            {formatDate(startDate)} - {formatDate(endDate)}
                        </span>
                    </div>
                    {organizerName && (
                        <div className="flex items-center gap-1.5">
                            <User className="h-4 w-4" />
                            <span>Organized by {organizerName}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-1.5">
                        <Users className="h-4 w-4" />
                        <span>{participantsCount} participants</span>
                    </div>
                </div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full sm:w-auto shrink-0">
                <Link href={linkHref}>
                    {linkText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
    );
}
