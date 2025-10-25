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
import { useTranslations } from "next-intl"

export function CreateEventForm() {
  const t = useTranslations("CreateEventForm")
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
        throw new Error(error.error || t("toast.createError"))
      }

      const data = await response.json()
      toast(t("toast.createSuccess"))
      router.push(`/events/${data.eventId}`)
    } catch (error) {
      toast(error instanceof Error ? error.message : t("toast.createError"), {
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
          <CardTitle>{t("sections.details.title")}</CardTitle>
          <CardDescription>{t("sections.details.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("labels.title")}</Label>
            <Input
              id="title"
              placeholder={t("placeholders.title")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("labels.description")}</Label>
            <Textarea
              id="description"
              placeholder={t("placeholders.description")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("sections.creator.title")}</CardTitle>
          <CardDescription>{t("sections.creator.description")}</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="creatorName">{t("labels.creatorName")}</Label>
            <Input
              id="creatorName"
              placeholder={t("placeholders.creatorName")}
              value={formData.creatorName}
              onChange={(e) => setFormData({ ...formData, creatorName: e.target.value })}
              required
              disabled={Boolean(user)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="creatorEmail">{t("labels.creatorEmail")}</Label>
            <Input
              id="creatorEmail"
              type="email"
              placeholder={t("placeholders.creatorEmail")}
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
          <CardTitle>{t("sections.dateTime.title")}</CardTitle>
          <CardDescription>{t("sections.dateTime.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t("labels.startDate")}</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">{t("labels.endDate")}</Label>
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
              <Label htmlFor="startTime">{t("labels.startTime")}</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">{t("labels.endTime")}</Label>
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
          <CardTitle>{t("sections.participants.title")}</CardTitle>
          <CardDescription>{t("sections.participants.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="participantEmails">{t("labels.participantEmails")}</Label>
            <Textarea
              id="participantEmails"
              placeholder={t("placeholders.participantEmails")}
              value={formData.participantEmails}
              onChange={(e) => setFormData({ ...formData, participantEmails: e.target.value })}
              rows={3}
              required
            />
            <p className="text-xs text-muted-foreground">
              {t("participantInfo")}
            </p>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t("creatingButton")}
          </>
        ) : (
          <>
            {t("createButton")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  )
}