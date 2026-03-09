import * as React from "react";
import { cn } from "@/lib/utils";

type KbdProps = React.HTMLAttributes<HTMLElement>

export function Kbd({ className, children, ...props }: KbdProps) {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </kbd>
  );
}

type KbdGroupProps = React.HTMLAttributes<HTMLSpanElement>

export function KbdGroup({ className, children, ...props }: KbdGroupProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      {...props}
    >
      {children}
    </span>
  );
}

