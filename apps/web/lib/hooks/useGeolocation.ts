"use client";

import {useEffect, useState} from "react";

export type LatLng = { lat: number; lng: number };

export type GeolocationState =
    | { status: "loading" }
    | { status: "ready"; coords: LatLng; source: "geolocation" | "fallback" }
    | { status: "error"; message: string; fallback: LatLng };

export interface UseGeolocationOptions {
    /** Used when the browser doesn't support geolocation, permission is denied, or the request errors. */
    fallback: LatLng;
    /** Milliseconds to wait before giving up and using the fallback. Defaults to 8000. */
    timeout?: number;
}

/**
 * Ask the browser for the user's current position.
 * Always resolves to a usable coordinate — falls back silently on failure.
 * Does NOT watch position; it's a one-shot on mount.
 */
export function useGeolocation({
                                   fallback,
                                   timeout = 8000,
                               }: UseGeolocationOptions): GeolocationState {
    const [state, setState] = useState<GeolocationState>({status: "loading"});

    useEffect(() => {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
            setState({
                status: "error",
                message: "Geolocation is not supported by this browser.",
                fallback,
            });
            return;
        }

        let cancelled = false;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (cancelled) return;
                setState({
                    status: "ready",
                    coords: {lat: pos.coords.latitude, lng: pos.coords.longitude},
                    source: "geolocation",
                });
            },
            (err) => {
                if (cancelled) return;
                setState({
                    status: "error",
                    message:
                        err.code === err.PERMISSION_DENIED
                            ? "Location permission denied."
                            : "Couldn't get your location.",
                    fallback,
                });
            },
            {enableHighAccuracy: false, timeout, maximumAge: 60_000},
        );

        return () => {
            cancelled = true;
        };
        // fallback is intentionally not in deps — we only want to run once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return state;
}
