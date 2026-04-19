import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {}

/**
 * Generic Card. The auth pages use this as the centered 380px container.
 * Translucent background + blur + layered shadow matches the handoff spec.
 */
export function Card({ className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "relative z-10 w-full max-w-[380px] rounded-xl border border-border",
        "bg-bg/95 p-8 shadow-card backdrop-blur-xl",
        "animate-fade-up",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}
