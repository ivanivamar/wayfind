import type {SavedPlace} from "@/lib/hooks/usePlaces";
import {StarIcon, TrashIcon} from "@/components/icons";

export function FavoriteRow({
    place,
    onClick,
    onRemove,
}: {
    place: SavedPlace;
    onClick: () => void;
    onRemove: () => void;
}) {
    return (
        <div className="group relative flex w-full items-center">
            <button
                type="button"
                onClick={onClick}
                className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors
                           duration-100 hover:bg-item-hover"
            >
                <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <StarIcon size={13} filled/>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="truncate text-[13px] font-medium text-fg-1">
                        {place.label ?? place.displayName}
                    </div>
                    <div className="truncate text-[11px] text-fg-3">{place.formattedAddress}</div>
                </div>
            </button>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                aria-label="Remove favorite"
                className="absolute right-3 flex h-7 w-7 items-center justify-center rounded-md text-fg-3
                           opacity-0 transition-opacity duration-100 hover:bg-surface-hover hover:text-fg-1
                           group-hover:opacity-100"
            >
                <TrashIcon size={12}/>
            </button>
        </div>
    );
}
