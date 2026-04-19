export function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-2.5 my-5">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-fg-3">{label}</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}
