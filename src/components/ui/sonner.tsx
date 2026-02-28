"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        unstyled: false,
        classNames: {
          toast:
            "!rounded-[12px] !border !border-[var(--border-subtle)] !backdrop-blur-md !shadow-[0_4px_24px_rgba(0,0,0,0.08)] dark:!shadow-[0_4px_24px_rgba(0,0,0,0.24)] !bg-[var(--elevated)] !text-[var(--text-primary)] !min-w-[360px]",
          description: "!text-[var(--text-secondary)]",
          actionButton: "!bg-[var(--accent)] !text-white !rounded-lg !font-medium",
          closeButton: "!text-[var(--text-secondary)] hover:!text-[var(--text-primary)]",
          success:
            "!border-l-[4px] !border-l-[#10B981]",
          error:
            "!border-l-[4px] !border-l-[#EF4444]",
          warning:
            "!border-l-[4px] !border-l-[#F59E0B]",
          info:
            "!border-l-[4px] !border-l-[#6366F1]",
        },
      }}
      style={
        {
          "--normal-bg": "var(--elevated)",
          "--normal-text": "var(--text-primary)",
          "--normal-border": "var(--border-subtle)",
          "--border-radius": "12px",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
