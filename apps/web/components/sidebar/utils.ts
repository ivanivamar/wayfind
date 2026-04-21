import type {PlaceDetails} from "@/lib/hooks/usePlacesAutocomplete";
import type {SavedPlace} from "@/lib/hooks/usePlaces";

export function savedPlaceToDetails(p: SavedPlace): PlaceDetails {
    return {
        placeId: p.googlePlaceId,
        displayName: p.displayName,
        formattedAddress: p.formattedAddress,
        location: p.location,
    };
}
