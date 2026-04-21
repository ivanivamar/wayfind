"use client";

import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
  /** Slot rendered on the right inside the field border, e.g. a toggle icon. */
  rightSlot?: ReactNode;
}

/**
 * Generic Input. Owns its label, field, focus ring, error + hint messages.
 * Pages pass value/onChange/error only — never class overrides.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, rightSlot, className, id, ...rest },
  ref,
) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className="flex flex-col gap-[5px]">
      <label htmlFor={inputId} className="text-[13px] font-medium text-fg-1">
        {label}
      </label>

      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            "h-[38px] w-full rounded-md px-3 text-sm text-fg-1 outline-none",
            "bg-surface focus:bg-surface-elevated",
            "border transition-[border-color,box-shadow,background-color] duration-150",
            error
              ? "border-danger focus:shadow-ring-danger"
              : "border-border focus:border-border-focus focus:shadow-ring-primary",
            rightSlot && "pr-10",
            className,
          )}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-2 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>

      {error ? (
        <span id={errorId} className="text-xs text-danger">
          {error}
        </span>
      ) : hint ? (
        <span id={hintId} className="text-xs text-fg-3">
          {hint}
        </span>
      ) : null}
    </div>
  );
});
