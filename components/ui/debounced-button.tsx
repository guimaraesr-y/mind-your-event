"use client"

import * as React from "react"
import { Button } from "./button"

interface DebouncedButtonProps extends React.ComponentProps<typeof Button> {
    debounceMs?: number
    debounceOnAppear?: boolean
}

const DebouncedButton = React.forwardRef<HTMLButtonElement, DebouncedButtonProps>(
    ({ onClick, disabled, debounceMs = 2000, debounceOnAppear = false, ...props }, ref) => {
        const [isLocked, setIsLocked] = React.useState(debounceOnAppear)

        React.useEffect(() => {
            if (debounceOnAppear) {
                const timer = setTimeout(() => {
                    setIsLocked(false)
                }, debounceMs)
                return () => clearTimeout(timer)
            }
        }, [debounceOnAppear, debounceMs])

        const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
            if (isLocked) return

            if (props.type === "submit" && !onClick) {
                // If it's a submit button without a custom onClick, 
                // we must let the event propagate to trigger the form submission 
                // before disabling the button.
                setTimeout(() => setIsLocked(true), 0)

                setTimeout(() => {
                    setIsLocked(false)
                }, debounceMs)
                return
            }

            setIsLocked(true)

            try {
                if (onClick) {
                    await onClick(e)
                }
            } finally {
                setTimeout(() => {
                    setIsLocked(false)
                }, debounceMs)
            }
        }

        return (
            <Button
                {...props}
                ref={ref}
                disabled={disabled || isLocked}
                onClick={handleClick}
            />
        )
    }
)

DebouncedButton.displayName = "DebouncedButton"

export { DebouncedButton }
