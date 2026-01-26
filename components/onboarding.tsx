"use client"

import { useEffect, useRef } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useTranslations } from "next-intl"

interface OnboardingProps {
  forceShow?: boolean
  onComplete?: () => void
  onStepChange?: (stepIndex: number) => void
  isLoading?: boolean
}

export function Onboarding({ forceShow = false, onComplete, onStepChange, isLoading = false }: OnboardingProps) {
  const t = useTranslations("Onboarding")
  const driverRef = useRef<any>(null)

  useEffect(() => {
    if (isLoading) return

    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")

    if (hasSeenOnboarding && !forceShow) {
      return
    }

    driverRef.current = driver({
      showProgress: true,
      allowClose: false,
      popoverClass: "driverjs-theme",
      nextBtnText: t("buttons.next"),
      prevBtnText: t("buttons.previous"),
      doneBtnText: t("buttons.done"),
      steps: [
        {
          element: "body",
          popover: {
            title: t("steps.welcome.popover.title"),
            description: t("steps.welcome.popover.description"),
            side: "bottom",
            align: "center",
          },
        },
        {
          element: ".dashboard-container",
          popover: {
            title: t("steps.dashboard.popover.title"),
            description: t("steps.dashboard.popover.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: ".create-event-button",
          popover: {
            title: t("steps.create.popover.title"),
            description: t("steps.create.popover.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[value="invitations"]',
          popover: {
            title: t("steps.invitations.popover.title"),
            description: t("steps.invitations.popover.description"),
            side: "bottom",
            align: "start",
          },
        },
        {
          element: ".walkthrough-trigger",
          popover: {
            title: t("steps.info.popover.title"),
            description: t("steps.info.popover.description"),
            side: "bottom",
            align: "start",
          },
        },
      ],
      onHighlightStarted: (element, step) => {
        if (onStepChange && driverRef.current) {
          onStepChange(driverRef.current.getActiveIndex())
        }
      },
      onDestroyed: () => {
        localStorage.setItem("hasSeenOnboarding", "true")
        if (onComplete) onComplete()
      },
    })

    driverRef.current.drive()

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy()
      }
    }
  }, [forceShow, t, onComplete, onStepChange, isLoading])

  return null
}
