import type {SavedPlace} from "@/lib/hooks/usePlaces";
import {PlusIcon, TrashIcon} from "@/components/icons";

export function SavedSlotRow({
    label,
    icon,
    place,
    onClick,
    onRemove,
}: {
    label: string;
    icon: React.ReactNode;
    place: SavedPlace | null;
    onClick: () => void;
    onRemove?: () => void;
}) {
    const empty = !place;
    return (
        <div className="group relative flex w-full items-center">
            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors
                           duration-100 hover:bg-item-hover"
            >
                <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                    ${empty ? "border border-dashed border-border text-fg-3" : "bg-primary/10 text-primary"}`}>
                    {empty ? <PlusIcon size={13}/> : icon}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-fg-1">{label}</div>
                    <div className="truncate text-[11px] text-fg-3">
                        {empty ? "Tap to set" : place.displayName}
                    </div>
                </div>
            </button>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove(); }}
                    aria-label={`Remove ${label}`}
                    className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-md text-fg-3
                               opacity-0 transition-opacity duration-100 hover:bg-surface-hover hover:text-fg-1
                               group-hover:opacity-100"
                >
                    <TrashIcon size={12}/>
                </button>
            )}
        </div>
    );
}
