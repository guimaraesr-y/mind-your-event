"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useMemo } from "react"
import { useFormatter, useTranslations } from "next-intl"

interface AvailabilityHeatmapProps {
  event: any
  availabilitySlots: any[]
  totalParticipants: number
}

export function AvailabilityHeatmap({ event, availabilitySlots, totalParticipants }: AvailabilityHeatmapProps) {
  const t = useTranslations("AvailabilityHeatmap")
  const format = useFormatter()

  // Generate date range
  const dateRange = useMemo(() => {
    const dates: Date[] = []
    const start = new Date(event.start_date)
    const end = new Date(event.end_date)

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(new Date(d))
    }
    return dates
  }, [event.start_date, event.end_date])

  // Calculate availability count per date
  const dateAvailability = useMemo(() => {
    const countMap = new Map<string, number>()

    availabilitySlots.forEach((slot) => {
      const count = countMap.get(slot.date) || 0
      countMap.set(slot.date, count + 1)
    })

    return countMap
  }, [availabilitySlots])

  const formatDate = (date: Date) => {
    return format.dateTime(date, {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const getIntensityColor = (count: number) => {
    const percentage = (count / totalParticipants) * 100

    if (percentage >= 75) return "bg-primary text-primary-foreground"
    if (percentage >= 50) return "bg-accent text-accent-foreground"
    if (percentage >= 25) return "bg-chart-4/60 text-foreground"
    if (percentage > 0) return "bg-muted text-muted-foreground"
    return "bg-muted/30 text-muted-foreground"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {dateRange.map((date) => {
            const dateISO = formatDateISO(date)
            const count = dateAvailability.get(dateISO) || 0
            const percentage = totalParticipants > 0 ? Math.round((count / totalParticipants) * 100) : 0

            return (
              <div key={dateISO} className="flex items-center gap-3">
                <div className="w-32 flex-shrink-0">
                  <p className="text-sm font-medium text-foreground">{formatDate(date)}</p>
                </div>
                <div className="flex-1 h-10 relative rounded-lg overflow-hidden bg-muted/30">
                  <div
                    className={`h-full transition-all ${getIntensityColor(count)}`}
                    style={{ width: `${percentage}%` }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {count} / {totalParticipants} ({percentage}%)
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground mb-3">{t("legend")}</p>
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-primary" />
              <span className="text-muted-foreground">{t("legendItems.high")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-accent" />
              <span className="text-muted-foreground">{t("legendItems.medium")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-chart-4/60" />
              <span className="text-muted-foreground">{t("legendItems.low")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-muted" />
              <span className="text-muted-foreground">{t("legendItems.veryLow")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}