"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { DebouncedButton } from "@/components/ui/debounced-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowRight, ArrowLeft, Check } from "lucide-react"
import { toast } from "react-toastify"
import { useAuth } from "@/contexts/auth-context"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

interface CreateEventFormProps {
  initialData?: {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    creatorName: string
    creatorEmail: string
  }
}

export function CreateEventForm({ initialData }: CreateEventFormProps) {
  const t = useTranslations("CreateEventForm")
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const createEventSchema = useMemo(() => z.object({
    title: z.string().min(3, t("validation.titleMin")),
    description: z.string().optional(),
    creatorName: z.string().min(2, t("validation.nameRequired")),
    creatorEmail: z.string().email(t("validation.emailInvalid")),
    startDate: z.string().min(1, t("validation.startDateRequired")),
    endDate: z.string().min(1, t("validation.endDateRequired")),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
    participantEmails: initialData
      ? z.string().optional()
      : z.string().refine((val) => {
        const emails = val.split(",").map(e => e.trim()).filter(e => e !== "");
        return emails.every(e => z.string().email().safeParse(e).success);
      }, t("validation.participantEmailsInvalid")),
  }), [t, initialData])

  type FormData = z.infer<typeof createEventSchema>

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      creatorName: initialData?.creatorName || user?.name || "",
      creatorEmail: initialData?.creatorEmail || user?.email || "",
      startDate: initialData?.startDate || "",
      endDate: initialData?.endDate || "",
      startTime: initialData?.startTime || "",
      endTime: initialData?.endTime || "",
      participantEmails: "",
    },
  })

  useEffect(() => {
    if (user && !initialData) {
      setValue("creatorName", user.name)
      setValue("creatorEmail", user.email)
    }
  }, [user, setValue, initialData])

  const nextStep = async () => {
    let fieldsToValidate: (keyof FormData)[] = []
    if (step === 1) fieldsToValidate = ["title", "description"]
    if (step === 2) fieldsToValidate = ["creatorName", "creatorEmail", "startDate", "endDate"]

    const isValid = await trigger(fieldsToValidate)
    if (isValid) setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const url = initialData ? `/api/events/${initialData.id}` : "/api/events"
      const method = initialData ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || (initialData ? t("toast.updateError") : t("toast.createError")))
      }

      const result = await response.json()
      toast.success(initialData ? t("toast.updateSuccess") : t("toast.createSuccess"))
      router.push(`/events/${initialData?.id || result.eventId}`)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : (initialData ? t("toast.updateError") : t("toast.createError")))
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { id: 1, title: t("sections.details.title") },
    { id: 2, title: t("sections.creator.title") },
    ...(!initialData ? [{ id: 3, title: t("sections.participants.title") }] : []),
  ]

  return (
    <div className="space-y-8">
      {/* Progress Indicator */}
      <div className="flex justify-between items-center max-w-md mx-auto mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors duration-200",
              step === s.id ? "border-primary bg-primary text-primary-foreground" :
                step > s.id ? "border-primary bg-primary text-primary-foreground" :
                  "border-muted text-muted-foreground"
            )}>
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            {i < steps.length - 1 && (
              <div className={cn(
                "h-0.5 flex-1 mx-2 transition-colors duration-200",
                step > s.id ? "bg-primary" : "bg-muted"
              )} />
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {step === 1 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
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
                  {...register("title")}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("labels.description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("placeholders.description")}
                  {...register("description")}
                  rows={3}
                />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>{t("sections.creator.title")}</CardTitle>
              <CardDescription>{t("sections.creator.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {user ? (
                  <div className="col-span-full p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {user.name?.[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                      {t("sections.creator.loggedIn") || "Organizing as you"}
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="creatorName">{t("labels.creatorName")}</Label>
                      <Input
                        id="creatorName"
                        placeholder={t("placeholders.creatorName")}
                        {...register("creatorName")}
                      />
                      {errors.creatorName && <p className="text-sm text-destructive">{errors.creatorName.message}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="creatorEmail">{t("labels.creatorEmail")}</Label>
                      <Input
                        id="creatorEmail"
                        type="email"
                        placeholder={t("placeholders.creatorEmail")}
                        {...register("creatorEmail")}
                      />
                      {errors.creatorEmail && <p className="text-sm text-destructive">{errors.creatorEmail.message}</p>}
                    </div>
                  </>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("labels.startDate")}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                  />
                  {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("labels.endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...register("endDate")}
                  />
                  {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">{t("labels.startTime")}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    {...register("startTime")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">{t("labels.endTime")}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    {...register("endTime")}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-in fade-in slide-in-from-right-4 duration-300">
            <CardHeader>
              <CardTitle>{t("sections.participants.title")}</CardTitle>
              <CardDescription>{t("sections.participants.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="participantEmails" className="text-base font-semibold">
                    {t("labels.participantEmails")}
                  </Label>
                  <div className="relative group">
                    <Textarea
                      id="participantEmails"
                      placeholder={t("placeholders.participantEmails")}
                      {...register("participantEmails")}
                      rows={6}
                      className="resize-none border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all rounded-xl"
                    />
                    <div className="absolute bottom-3 right-3 opacity-50 group-focus-within:opacity-100 transition-opacity">
                      <Loader2 className={cn("h-4 w-4 animate-spin hidden", isLoading && "block")} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 border border-muted-foreground/10">
                    <Loader2 className="h-4 w-4 text-primary shrink-0 rotate-45" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t("participantInfo")}
                    </p>
                  </div>
                  {errors.participantEmails && (
                    <p className="text-sm font-medium text-destructive mt-2 animate-in fade-in slide-in-from-top-1">
                      {errors.participantEmails.message}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-4">
          {step > 1 && (
            <DebouncedButton type="button" variant="outline" onClick={prevStep} className="flex-1" debounceOnAppear>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("previousButton") || "Previous"}
            </DebouncedButton>
          )}

          {step < steps.length ? (
            <DebouncedButton type="button" onClick={nextStep} className="flex-1 ml-auto" debounceOnAppear>
              {t("nextButton") || "Next"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </DebouncedButton>
          ) : (
            <DebouncedButton type="submit" size="lg" className="flex-1 ml-auto" disabled={isLoading} debounceOnAppear>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? (t("updatingButton") || "Updating...") : t("creatingButton")}
                </>
              ) : (
                <>
                  {initialData ? (t("updateButton") || "Update") : t("createButton")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </DebouncedButton>
          )}
        </div>
      </form>
    </div>
  )
}