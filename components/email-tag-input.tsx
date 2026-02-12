"use client"

import { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { toast } from "react-toastify"
import { useTranslations } from "next-intl"
import * as z from "zod"

interface EmailTagInputProps {
    value: string[]
    onChange: (value: string[]) => void
    label: string
    placeholder: string
    disabled?: boolean
    error?: string
}

export function EmailTagInput({
    value = [],
    onChange,
    label,
    placeholder,
    disabled,
    error,
}: EmailTagInputProps) {
    const t = useTranslations("CreateEventForm")
    const [emailInput, setEmailInput] = useState("")

    const addEmails = (e?: React.KeyboardEvent | React.MouseEvent) => {
        // Always prevent form submission on Enter in this input
        if (e && 'key' in e && e.key === 'Enter') {
            e.preventDefault()
        }

        const isSeparator = e && 'key' in e && (e.key === 'Enter' || e.key === ',' || e.key === ' ' || e.key === ';')
        const isButtonClick = e && !('key' in e)

        if (e && 'key' in e && !isSeparator) return
        if (isButtonClick) e.preventDefault()

        const inputParts = emailInput.split(/[,\s;]+/).map(e => e.trim()).filter(Boolean)
        if (inputParts.length === 0) return

        const emailSchema = z.string().email()
        const newEmails: string[] = []
        const invalidEmails: string[] = []

        inputParts.forEach(part => {
            if (emailSchema.safeParse(part).success) {
                if (!value.includes(part) && !newEmails.includes(part)) {
                    newEmails.push(part)
                }
            } else {
                invalidEmails.push(part)
            }
        })

        if (invalidEmails.length > 0) {
            toast.error(`${t("validation.emailInvalid")}: ${invalidEmails.join(", ")}`)
        }

        if (newEmails.length > 0) {
            onChange([...value, ...newEmails])
            setEmailInput("")
        } else if (invalidEmails.length === 0 && emailInput.trim() !== "") {
            // If all were valid but already in the list, just clear the input
            setEmailInput("")
        }
    }

    const removeEmail = (emailToRemove: string) => {
        onChange(value.filter(e => e !== emailToRemove))
    }

    return (
        <div className="space-y-2">
            <Label htmlFor="email-tag-input" className="text-base font-semibold">
                {label}
            </Label>

            <div className="space-y-3">
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-muted/30 border-2 border-dashed border-muted-foreground/20">
                    {value.length === 0 ? (
                        <p className="text-sm text-muted-foreground p-2">{t("noParticipantsYet") || "No participants added yet."}</p>
                    ) : (
                        value.map((email) => (
                            <div
                                key={email}
                                className="flex items-center gap-1.5 bg-primary text-primary-foreground bg-primary px-3 py-1.5 rounded-full text-sm font-medium animate-in zoom-in-95 duration-200"
                            >
                                <span className="max-w-[200px] truncate">{email}</span>
                                <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="hover:bg-primary-foreground/20 rounded-full p-0.5 transition-colors cursor-pointer"
                                    disabled={disabled}
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex gap-2">
                    <Input
                        id="email-tag-input"
                        placeholder={placeholder}
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        onKeyDown={addEmails}
                        disabled={disabled}
                        className="rounded-xl border-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all"
                    />
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => addEmails()}
                        disabled={disabled || !emailInput.trim()}
                        className="rounded-xl px-4"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {t("addButton") || "Add"}
                    </Button>
                </div>
            </div>

            {error && (
                <p className="text-sm font-medium text-destructive mt-2 animate-in fade-in slide-in-from-top-1">
                    {error}
                </p>
            )}
        </div>
    )
}
