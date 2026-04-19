"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Generic Button. All visual decisions (height, radius, color, hover, active,
 * focus, disabled) are encapsulated here. Pages must not override these
 * with their own classes — if a new shape is needed, add a variant.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    loading = false,
    loadingText,
    leftIcon,
    fullWidth = true,
    disabled,
    className,
    children,
    type = "button",
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;

  const base =
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium " +
    "transition-[background-color,border-color,transform] duration-150 " +
    "active:scale-[0.97] disabled:cursor-default focus-visible:outline-none " +
    "focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 " +
    "focus-visible:ring-offset-bg";

  const sizeByVariant: Record<Variant, string> = {
    primary: "h-10",   // 40px — matches handoff spec
    secondary: "h-[38px]", // 38px — matches handoff spec
  };

  const variants: Record<Variant, string> = {
    primary:
      "bg-primary text-white hover:bg-primary-hover disabled:bg-primary-disabled",
    secondary:
      "bg-white text-fg-1 border border-border hover:bg-surface hover:border-[#C4AC94] " +
      "disabled:opacity-60",
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        base,
        sizeByVariant[variant],
        variants[variant],
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText ?? children}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
        </>
      )}
    </button>
  );
});
