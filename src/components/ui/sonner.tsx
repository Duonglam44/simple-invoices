"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

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
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // `!` (important) is required to win against sonner's own injected
          // stylesheet, which targets these same elements with attribute
          // selectors of higher specificity than a single utility class.
          toast: "cn-toast !items-start !gap-3 !shadow-lg",
          icon: "!mt-0.5",
          title: "!text-sm !font-semibold",
          description: "!text-muted-foreground !text-sm !mt-0.5",
          // Background/border stay neutral (themed via --normal-* above) for
          // every type — only the icon is tinted, so the toast reads as part
          // of the app's own card style rather than a solid color block.
          success:
            "[&_[data-icon]]:!text-emerald-600 dark:[&_[data-icon]]:!text-emerald-500",
          error: "[&_[data-icon]]:!text-destructive",
          warning:
            "[&_[data-icon]]:!text-amber-600 dark:[&_[data-icon]]:!text-amber-500",
          info: "[&_[data-icon]]:!text-blue-600 dark:[&_[data-icon]]:!text-blue-500",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
