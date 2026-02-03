"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, UserPlus } from "lucide-react"
import { toast } from "react-toastify"
import { useTranslations } from "next-intl"
import { joinEvent } from "@/actions/event/join"
import { useRouter } from "next/navigation"

import Link from "next/link"
import { UserInterface } from "@/modules/user/user"

interface JoinEventFormProps {
    token: string
    currentUser?: UserInterface | null
}

export function JoinEventForm({ token, currentUser }: JoinEventFormProps) {
    const t = useTranslations("JoinEvent")
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [showLoginLink, setShowLoginLink] = useState(false)

    const joinSchema = z.object({
        name: z.string().min(2, t("nameLabel")),
        email: z.string().email(t("emailLabel")),
    })

    type FormData = z.infer<typeof joinSchema>

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(joinSchema),
        defaultValues: {
            name: currentUser?.name || "",
            email: currentUser?.email || "",
        },
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        setShowLoginLink(false)
        try {
            const result = await joinEvent(token, data.name, data.email)

            if (!result.success) {
                if (result.error?.includes("registered")) {
                    setShowLoginLink(true)
                }
                throw new Error(result.error || t("error"))
            }

            router.push(`/invite/${result.inviteToken}`)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : t("error"))
        } finally {
            setIsLoading(false)
        }
    }

    const isUserLoggedIn = !!currentUser

    return (
        <Card className="md:w-[50vw] w-[95vw] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                    <UserPlus className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">{t("title")}</CardTitle>
                <CardDescription>
                    {isUserLoggedIn
                        ? t("loggedInAs", { name: currentUser.name })
                        : t("description")
                    }
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {!isUserLoggedIn && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="name">{t("nameLabel")}</Label>
                                <Input
                                    id="name"
                                    placeholder={t("namePlaceholder")}
                                    {...register("name")}
                                    disabled={isLoading}
                                />
                                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t("emailLabel")}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("emailPlaceholder")}
                                    {...register("email")}
                                    disabled={isLoading}
                                />
                                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                            </div>
                        </>
                    )}

                    {isUserLoggedIn && (
                        <div className="p-4 rounded-lg bg-muted/50 border mb-4">
                            <p className="text-sm font-medium">{t("joinAs", { email: currentUser.email })}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                {t("joining")}
                            </>
                        ) : (
                            isUserLoggedIn ? t("submitButton") : t("submitButton")
                        )}
                    </Button>

                    {showLoginLink && (
                        <div className="text-center mt-4">
                            <p className="text-sm text-muted-foreground">
                                {t("alreadyRegistered")}{" "}
                                <Link
                                    href={`/login?callbackUrl=/invite/${token}`}
                                    className="text-primary hover:underline font-semibold"
                                >
                                    {t("loginToJoin")}
                                </Link>
                            </p>
                        </div>
                    )}
                </form>
            </CardContent>
        </Card>
    )
}
