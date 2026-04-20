"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "ghost" | "subtle";

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  /** Required for accessibility — no visible text. */
  label: string;
  variant?: Variant;
  size?: 20 | 28 | 34;
}

/**
 * Generic icon-only button. Square, rounded, no visible label.
 * Used for clear-input, close, collapse, etc.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { icon, label, variant = "ghost", size = 28, className, ...rest },
    ref,
  ) {
    const variants: Record<Variant, string> = {
      ghost: "text-fg-3 hover:text-fg-1 hover:bg-surface",
      subtle: "text-fg-2 bg-surface hover:bg-border/50",
    };

    const sizes = {
      20: "h-5 w-5 rounded",
      28: "h-7 w-7 rounded-md",
      34: "h-[34px] w-[34px] rounded-md",
    } as const;

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        className={cn(
          "inline-flex items-center justify-center transition-colors duration-150",
          "active:scale-[0.95] focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-primary/40",
          sizes[size],
          variants[variant],
          className,
        )}
        {...rest}
      >
        {icon}
      </button>
    );
  },
);
