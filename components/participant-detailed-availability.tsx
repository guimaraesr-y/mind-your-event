"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { User, Check, Clock, ChevronDown, ChevronUp, Search, Calendar } from "lucide-react"
import { useFormatter, useTranslations } from "next-intl"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface ParticipantDetailedAvailabilityProps {
    participants: any[]
    availabilitySlots: any[]
}

export function ParticipantDetailedAvailability({ participants, availabilitySlots }: ParticipantDetailedAvailabilityProps) {
    const t = useTranslations("ParticipantDetailedAvailability")
    const format = useFormatter()
    const [searchTerm, setSearchTerm] = useState("")
    const [expandedParticipants, setExpandedParticipants] = useState<string[]>([])

    const toggleParticipant = (userId: string) => {
        setExpandedParticipants((current) =>
            current.includes(userId)
                ? current.filter((id) => id !== userId)
                : [...current, userId]
        )
    }

    const filteredParticipants = participants.filter((p) =>
        p.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.users.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getParticipantSlots = (userId: string) => {
        return availabilitySlots.filter((slot) => slot.user_id === userId)
    }

    const groupSlotsByDate = (slots: any[]) => {
        const grouped: Record<string, any[]> = {}
        slots.forEach((slot) => {
            if (!grouped[slot.date]) {
                grouped[slot.date] = []
            }
            grouped[slot.date].push(slot)
        })
        return Object.entries(grouped).sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
    }

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return format.dateTime(date, {
            weekday: "long",
            month: "short",
            day: "numeric",
        })
    }

    const formatTime = (time?: string) => {
        if (!time) return "--:--";
        const [hours, minutes] = time.split(":").map(Number)
        const date = new Date()
        date.setHours(hours, minutes, 0, 0)
        return format.dateTime(date, { hour: "2-digit", minute: "2-digit" })
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle>{t("title")}</CardTitle>
                        <CardDescription>{t("description")}</CardDescription>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t("searchPlaceholder")}
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {filteredParticipants.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8">{t("noParticipants")}</p>
                    ) : (
                        filteredParticipants.map((participant) => {
                            const slots = getParticipantSlots(participant.user_id)
                            const uniqueDates = new Set(slots.map((s) => s.date)).size
                            const isExpanded = expandedParticipants.includes(participant.user_id)
                            const groupedSlots = groupSlotsByDate(slots)

                            return (
                                <Collapsible
                                    key={participant.id}
                                    open={isExpanded}
                                    onOpenChange={() => toggleParticipant(participant.user_id)}
                                    className="border rounded-lg overflow-hidden"
                                >
                                    <CollapsibleTrigger asChild>
                                        <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors bg-muted/20">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <User className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-foreground truncate">{participant.users.name}</p>
                                                    <p className="text-xs text-muted-foreground truncate">{participant.users.email}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 ml-4">
                                                {participant.has_submitted ? (
                                                    <div className="hidden sm:flex flex-col items-end">
                                                        <p className="text-sm font-medium text-foreground">{t("timeSlots", { count: slots.length })}</p>
                                                        <p className="text-xs text-muted-foreground">{t("days", { count: uniqueDates })}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-xs text-muted-foreground hidden sm:block">{t("pending")}</p>
                                                )}

                                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${participant.has_submitted ? "bg-accent/20" : "bg-muted"}`}>
                                                    {participant.has_submitted ? (
                                                        <Check className="h-4 w-4 text-accent" />
                                                    ) : (
                                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>

                                                {participant.has_submitted && (
                                                    isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CollapsibleTrigger>

                                    <CollapsibleContent>
                                        <div className="p-4 pt-0 border-t bg-background/50">
                                            {groupedSlots.length > 0 ? (
                                                <div className="space-y-4 pt-4">
                                                    {groupedSlots.map(([date, dateSlots]) => (
                                                        <div key={date} className="space-y-2">
                                                            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDate(date)}
                                                            </h4>
                                                            <div className="flex flex-wrap gap-2">
                                                                {dateSlots.map((slot, idx) => (
                                                                    <div
                                                                        key={idx}
                                                                        className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium border border-primary/20"
                                                                    >
                                                                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground pt-4 text-center">{t("pending")}</p>
                                            )}
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            )
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
