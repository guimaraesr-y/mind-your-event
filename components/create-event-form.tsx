"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight } from "lucide-react"
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/auth-context"

export function CreateEventForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    creatorName: "",
    creatorEmail: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    participantEmails: "",
  })

  useEffect(() => {
    if (!user) return
    setFormData({
      ...formData,
      creatorName: user.name,
      creatorEmail: user.email,
    })
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => { // TODO: add redirect to event after email verification
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create event")
      }

      const data = await response.json()
      toast("Event created successfully!")
      router.push(`/events/${data.eventId}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : "Failed to create event", {
        type: "error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>1. Event Details</CardTitle>
          <CardDescription>Start with the basic information about your event.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Team Meeting, Birthday Party"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this event about?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Your Information</CardTitle>
          <CardDescription>This will identify you as the event organizer.</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creatorName">Your Name *</Label>
            <Input
              id="creatorName"
              placeholder="John Doe"
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              required
              disabled={Boolean(user)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creatorEmail">Your Email *</Label>
            <Input
              id="creatorEmail"
              type="email"
              placeholder="john@example.com"
              value={formData.creatorEmail}
              onChange={(e) => setFormData({ ...formData, creatorEmail: e.target.value })}
              required
              disabled={Boolean(user)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Date & Time Range</CardTitle>
          <CardDescription>When could this event potentially happen?</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Preferred Start Time (Optional)</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">Preferred End Time (Optional)</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Invite Participants</CardTitle>
          <CardDescription>Enter email addresses separated by commas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participantEmails">Participant Emails *</Label>
            <Textarea
              id="participantEmails"
              placeholder="alice@example.com, bob@example.com"
              value={formData.participantEmails}
              onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              Each participant will receive a unique link to submit their availability.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Event...
          </>
        ) : (
          <>
            Create Event & Get Shareable Links
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}
