"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

import { useTranslations } from "next-intl"

interface ConfirmEventDialogProps {
  eventId: string
  suggestedDate?: string
  suggestedStartTime?: string
  suggestedEndTime?: string
}

export function ConfirmEventDialog({
  eventId,
  suggestedDate,
  suggestedStartTime,
  suggestedEndTime,
}: ConfirmEventDialogProps) {
  const t = useTranslations("ConfirmEventDialog")
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    finalizedDate: suggestedDate || "",
    finalizedStartTime: suggestedStartTime || "",
    finalizedEndTime: suggestedEndTime || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/events/${eventId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || t("error"))
      }

      toast.success(t("success"))

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("error"))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          {t("trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>
            {t("description")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finalizedDate">{t("dateLabel")}</Label>
            <Input
              id="finalizedDate"
              type="date"
              value={formData.finalizedDate}
              onChange={(e) => setFormData({ ...formData, finalizedDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="finalizedStartTime">{t("startTimeLabel")}</Label>
              <Input
                id="finalizedStartTime"
                type="time"
                value={formData.finalizedStartTime}
                onChange={(e) => setFormData({ ...formData, finalizedStartTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalizedEndTime">{t("endTimeLabel")}</Label>
              <Input
                id="finalizedEndTime"
                type="time"
                value={formData.finalizedEndTime}
                onChange={(e) => setFormData({ ...formData, finalizedEndTime: e.target.value })}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("submitting")}
              </>
            ) : (
              t("submitButton")
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
