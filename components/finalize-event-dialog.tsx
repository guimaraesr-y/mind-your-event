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
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface FinalizeEventDialogProps {
  eventId: string
  suggestedDate?: string
  suggestedStartTime?: string
  suggestedEndTime?: string
}

export function FinalizeEventDialog({
  eventId,
  suggestedDate,
  suggestedStartTime,
  suggestedEndTime,
}: FinalizeEventDialogProps) {
  const { toast } = useToast()
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
        throw new Error(error.error || "Failed to finalize event")
      }

      toast({
        title: "Event finalized!",
        description: "All participants have been notified",
      })

      setOpen(false)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to finalize event",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Finalize Event
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Finalize Event</DialogTitle>
          <DialogDescription>
            Set the final date and time for this event. All participants will be notified.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="finalizedDate">Final Date *</Label>
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
              <Label htmlFor="finalizedStartTime">Start Time *</Label>
              <Input
                id="finalizedStartTime"
                type="time"
                value={formData.finalizedStartTime}
                onChange={(e) => setFormData({ ...formData, finalizedStartTime: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="finalizedEndTime">End Time *</Label>
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
                Finalizing...
              </>
            ) : (
              "Confirm & Notify Participants"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
