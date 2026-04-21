import type {PlaceDetails} from "@/lib/hooks/usePlacesAutocomplete";
import type {SavedPlace} from "@/lib/hooks/usePlaces";
import {HomeIcon, WorkIcon} from "@/components/icons";

export function QuickPicks({
    currentLocation,
    home,
    work,
    onPick,
}: {
    currentLocation: PlaceDetails | null;
    home: SavedPlace | null;
    work: SavedPlace | null;
    onPick: (place: PlaceDetails) => void;
}) {
    const rows: {key: string; icon: React.ReactNode; primary: string; secondary?: string; place: PlaceDetails}[] = [];
    if (currentLocation) {
        rows.push({
            key: "loc",
            icon: <div className="h-2 w-2 rounded-full bg-primary ring-2 ring-primary/30"/>,
            primary: "Your location",
            place: currentLocation,
        });
    }
    if (home) {
        rows.push({
            key: "home",
            icon: <HomeIcon size={13}/>,
            primary: "Home",
            secondary: home.displayName,
            place: {
                placeId: home.googlePlaceId,
                displayName: home.displayName,
                formattedAddress: home.formattedAddress,
                location: home.location,
            },
        });
    }
    if (work) {
        rows.push({
            key: "work",
            icon: <WorkIcon size={13}/>,
            primary: "Work",
            secondary: work.displayName,
            place: {
                placeId: work.googlePlaceId,
                displayName: work.displayName,
                formattedAddress: work.formattedAddress,
                location: work.location,
            },
        });
    }
    if (rows.length === 0) return null;
    return (
        <div className="absolute left-0 right-0 top-full z-20 mt-1.5 overflow-hidden rounded-lg
                        border border-surface-hover bg-surface-elevated shadow-dropdown">
            {rows.map((r) => (
                <button
                    key={r.key}
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); onPick(r.place); }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                               duration-100 hover:bg-item-hover"
                >
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                        {r.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-fg-1">{r.primary}</div>
                        {r.secondary && (
                            <div className="truncate text-[11px] text-fg-3">{r.secondary}</div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
