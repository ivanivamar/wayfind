import { cn } from "@/lib/cn";

export function Wordmark({
  subtitle,
  className,
}: {
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-7 text-center", className)}>
      <div className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-fg-1">
        way<span className="text-primary">find</span>
      </div>
      {subtitle && (
        <div className="mt-1.5 text-[13px] text-fg-3">{subtitle}</div>
      )}
    </div>
  );
}
