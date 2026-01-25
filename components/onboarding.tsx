"use client"

import { useEffect, useRef } from "react"
import { driver } from "driver.js"
import "driver.js/dist/driver.css"
import { useTranslations } from "next-intl"

interface OnboardingProps {
  forceShow?: boolean
  onComplete?: () => void
}

export function Onboarding({ forceShow = false, onComplete }: OnboardingProps) {
  const t = useTranslations("Onboarding")
  const driverRef = useRef<any>(null)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding")

    if (!hasSeenOnboarding || forceShow) {
      driverRef.current = driver({
        showProgress: true,
        allowClose: false,
        nextBtnText: t("buttons.next"),
        prevBtnText: t("buttons.previous"),
        doneBtnText: t("buttons.done"),
        steps: [
          {
            element: "body",
            popover: {
              title: t("steps.welcome.popover.title"),
              description: t("steps.welcome.popover.description"),
              position: "center",
            },
          },
          {
            element: ".dashboard-container",
            popover: {
              title: t("steps.dashboard.popover.title"),
              description: t("steps.dashboard.popover.description"),
              position: "bottom",
            },
          },
          {
            element: ".create-event-button",
            popover: {
              title: t("steps.create.popover.title"),
              description: t("steps.create.popover.description"),
              position: "bottom",
            },
          },
          {
            element: '[value="invitations"]',
            popover: {
              title: t("steps.invitations.popover.title"),
              description: t("steps.invitations.popover.description"),
              position: "bottom",
            },
          },
          {
            element: ".walkthrough-trigger",
            popover: {
              title: t("steps.info.popover.title"),
              description: t("steps.info.popover.description"),
              position: "bottom",
            },
          },
        ],
        onDestroyed: () => {
          localStorage.setItem("hasSeenOnboarding", "true")
          if (onComplete) onComplete()
        },
      })

      driverRef.current.drive()
    }

    return () => {
      if (driverRef.current) {
        driverRef.current.destroy()
      }
    }
  }, [forceShow, t, onComplete])

  return null
}
