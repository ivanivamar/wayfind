"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useMapsLibrary} from "@vis.gl/react-google-maps";
import type {LatLng} from "./useGeolocation";

export interface PlaceSuggestion {
    /** Stable ID from Google; pass to `fetchPlaceDetails` to resolve coordinates. */
    placeId: string;
    /** Primary line, e.g. "Gare du Nord". */
    mainText: string;
    /** Secondary line, e.g. "Paris, France". */
    secondaryText: string;
    /** Place types — useful for picking an icon. */
    types: string[];
}

export interface PlaceDetails {
    placeId: string;
    displayName: string;
    formattedAddress: string;
    location: LatLng;
}

export interface UsePlacesAutocompleteOptions {
    input: string;
    /** Bias suggestions toward this point (e.g. user's current location). */
    biasLocation?: LatLng | null;
    /** Debounce in ms. Default 250. */
    debounceMs?: number;
    /** Minimum chars before querying. Default 2. */
    minChars?: number;
}

export interface UsePlacesAutocompleteResult {
    suggestions: PlaceSuggestion[];
    loading: boolean;
    /**
     * Resolve a suggestion to full place details (coordinates, formatted address).
     * Rotates the session token afterwards, so the next typing session is billed
     * as a new session per Google's pricing guidelines.
     */
    fetchPlaceDetails: (s: PlaceSuggestion) => Promise<PlaceDetails | null>;
}

/**
 * Google Places Autocomplete using the NEW AutocompleteSuggestion API.
 *
 * Why the new API: google.maps.places.AutocompleteService is deprecated as of
 * March 2025 and unavailable to new customers. See:
 * https://developers.google.com/maps/documentation/javascript/places-migration-autocomplete
 *
 * Requires the "Places API (New)" to be enabled on your Google Cloud project,
 * and the Maps key's API restrictions to include it.
 */
export function usePlacesAutocomplete(
    {
        input,
        biasLocation = null,
        debounceMs = 250,
        minChars = 2,
    }: UsePlacesAutocompleteOptions): UsePlacesAutocompleteResult {
    const placesLib = useMapsLibrary("places");
    const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
    const [loading, setLoading] = useState(false);

    // Session token is created lazily once the library is loaded, and rotated
    // after fetchPlaceDetails — one typing session + one details call = one bill.
    const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

    // Incrementing request ID so stale responses can be discarded when typing fast.
    const requestIdRef = useRef(0);

    const ensureSessionToken = useCallback(() => {
        if (!placesLib) return null;
        if (!sessionTokenRef.current) {
            sessionTokenRef.current = new placesLib.AutocompleteSessionToken();
        }
        return sessionTokenRef.current;
    }, [placesLib]);

    useEffect(() => {
        if (!placesLib) return;
        const trimmed = input.trim();
        if (trimmed.length < minChars) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        const token = ensureSessionToken();
        if (!token) return;

        setLoading(true);
        const myRequestId = ++requestIdRef.current;

        const handle = window.setTimeout(async () => {
            try {
                const request: google.maps.places.AutocompleteRequest = {
                    input: trimmed,
                    sessionToken: token,
                    ...(biasLocation && {
                        locationBias: {lat: biasLocation.lat, lng: biasLocation.lng},
                    }),
                };

                const {suggestions: raw} =
                    await placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions(
                        request,
                    );

                // Stale-response guard — only commit if we're still the latest request.
                if (myRequestId !== requestIdRef.current) return;

                const mapped: PlaceSuggestion[] = raw
                    .map((s) => s.placePrediction)
                    .filter((p): p is google.maps.places.PlacePrediction => p !== null)
                    .map((p) => ({
                        placeId: p.placeId,
                        mainText: p.mainText?.text ?? p.text.text,
                        secondaryText: p.secondaryText?.text ?? "",
                        types: p.types ?? [],
                    }));

                setSuggestions(mapped);
            } catch (err) {
                if (myRequestId !== requestIdRef.current) return;
                // eslint-disable-next-line no-console
                console.warn("Places autocomplete failed:", err);
                setSuggestions([]);
            } finally {
                if (myRequestId === requestIdRef.current) setLoading(false);
            }
        }, debounceMs);

        return () => window.clearTimeout(handle);
    }, [
        placesLib,
        input,
        biasLocation?.lat,
        biasLocation?.lng,
        debounceMs,
        minChars,
        ensureSessionToken,
    ]);

    const fetchPlaceDetails = useCallback<
        UsePlacesAutocompleteResult["fetchPlaceDetails"]
    >(
        async (s) => {
            if (!placesLib) return null;
            try {
                // We don't have the PlacePrediction object anymore, so build a Place
                // directly from the placeId and fetch the fields we need.
                const place = new placesLib.Place({id: s.placeId});
                await place.fetchFields({
                    fields: ["displayName", "formattedAddress", "location"],
                });

                // Rotate the session token — this ends the billable session.
                sessionTokenRef.current = new placesLib.AutocompleteSessionToken();

                const loc = place.location;
                if (!loc) return null;

                return {
                    placeId: s.placeId,
                    displayName: place.displayName ?? s.mainText,
                    formattedAddress: place.formattedAddress ?? s.secondaryText,
                    location: {lat: loc.lat(), lng: loc.lng()},
                };
            } catch (err) {
                // eslint-disable-next-line no-console
                console.warn("Place details fetch failed:", err);
                return null;
            }
        },
        [placesLib],
    );

    return {suggestions, loading, fetchPlaceDetails};
}
