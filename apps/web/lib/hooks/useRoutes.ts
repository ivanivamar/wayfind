"use client";

import {useEffect, useState} from "react";
import {useMapsLibrary} from "@vis.gl/react-google-maps";
import type {LatLng} from "./useGeolocation";

export type RouteStep =
    | {
          type: "walk";
          instructions: string;
          distance?: string;
          duration?: string;
          durationMs?: number;
          distanceMeters?: number;
          path: LatLng[];
      }
    | {
          type: "transit";
          line: {code: string; bg: string; fg: string};
          lineName?: string;
          departStop: string;
          arriveStop: string;
          numStops: number;
          departTime?: string;
          arriveTime?: string;
          duration?: string;
          path: LatLng[];
      };

export interface RouteResult {
    id: string;
    duration: string;
    distance?: string;
    summary: string;
    lines?: {code: string; bg: string; fg: string}[];
    depart?: string;
    arrive?: string;
    fastest: boolean;
    steps: RouteStep[];
}

export interface UseRoutesOptions {
    origin: LatLng | null;
    destination: LatLng | null;
    travelMode: "walk" | "transit";
    timeOption: "now" | "depart" | "arrive";
    date: string;
    time: string;
}

export function useRoutes({origin, destination, travelMode, timeOption, date, time}: UseRoutesOptions) {
    const routesLib = useMapsLibrary("routes");
    const [routes, setRoutes] = useState<RouteResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const oLat = origin?.lat;
    const oLng = origin?.lng;
    const dLat = destination?.lat;
    const dLng = destination?.lng;

    useEffect(() => {
        if (!routesLib || !origin || !destination) {
            setRoutes([]);
            setLoading(false);
            return;
        }

        let cancelled = false;
        setLoading(true);
        setError(null);

        // Build time options
        let departureTime: Date | undefined;
        let arrivalTime: Date | undefined;

        if (travelMode === "transit") {
            if (timeOption === "now") {
                departureTime = new Date();
            } else {
                const [year, month, day] = date.split("-").map(Number);
                const [h, m] = time.split(":").map(Number);
                const dt = new Date(year, month - 1, day, h, m);
                if (timeOption === "depart") departureTime = dt;
                else arrivalTime = dt;
            }
        }

        // 400 ms debounce — avoids hammering the API on time-picker changes
        const timer = window.setTimeout(async () => {
            try {
                const {routes: raw} = await routesLib.Route.computeRoutes({
                    origin: {lat: origin.lat, lng: origin.lng},
                    destination: {lat: destination.lat, lng: destination.lng},
                    travelMode: travelMode === "walk" ? "WALKING" : "TRANSIT",
                    ...(departureTime && {departureTime}),
                    ...(arrivalTime && {arrivalTime}),
                    computeAlternativeRoutes: true,
                    fields: ["*"],
                });

                if (cancelled) return;
                setLoading(false);

                if (!raw || raw.length === 0) {
                    setRoutes([]);
                    return;
                }

                const parsed = raw.map((r, i) => parseRoute(r, i, travelMode));

                // Mark fastest by raw durationMillis
                if (parsed.length > 0) {
                    let minMs = Infinity;
                    let fastestIdx = 0;
                    raw.forEach((r, i) => {
                        const ms = r.durationMillis ?? r.legs?.[0]?.durationMillis ?? Infinity;
                        if (ms != null && ms < minMs) { minMs = ms; fastestIdx = i; }
                    });
                    parsed[fastestIdx].fastest = true;
                }

                setRoutes(parsed);
            } catch (err) {
                if (cancelled) return;
                setLoading(false);
                setError(String(err));
                setRoutes([]);
            }
        }, 400);

        return () => { cancelled = true; clearTimeout(timer); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [routesLib, oLat, oLng, dLat, dLng, travelMode, timeOption, date, time]);

    return {routes, loading, error};
}

// ── helpers ──────────────────────────────────────────────────────────────────

function fmtMillis(ms: number | null | undefined): string {
    if (!ms) return "—";
    const totalMin = Math.round(ms / 60_000);
    if (totalMin < 60) return `${totalMin} min`;
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function fmtMeters(m: number | undefined): string {
    if (m == null) return "";
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${m} m`;
}

function fmtTime(d: Date | null | undefined): string | undefined {
    if (!d) return undefined;
    return d.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit", hour12: false});
}

function parseRoute(
    route: google.maps.routes.Route,
    index: number,
    mode: "walk" | "transit",
): RouteResult {
    const leg = route.legs?.[0];
    const lv = leg?.localizedValues;

    const duration = lv?.staticDuration ?? fmtMillis(leg?.durationMillis);
    const distance = lv?.distance ?? fmtMeters(leg?.distanceMeters);
    const steps = leg ? parseSteps(leg) : [];

    if (mode === "walk") {
        return {
            id: `route-${index}`,
            duration,
            distance,
            summary: route.description ? `Via ${route.description}` : "Walking route",
            fastest: false,
            steps,
        };
    }

    const transitSteps = (leg?.steps ?? []).filter((s) => s.transitDetails != null);

    const lines = transitSteps.map((s) => {
        const line = s.transitDetails!.transitLine;
        return {
            code: line?.shortName ?? line?.name ?? "?",
            bg: line?.color ?? "#888888",
            fg: line?.textColor ?? "#ffffff",
        };
    });

    const firstTd = transitSteps[0]?.transitDetails;
    const lastTd = transitSteps[transitSteps.length - 1]?.transitDetails;

    let summary = "";
    if (transitSteps.length > 1) {
        summary = `via ${firstTd?.arrivalStop?.name ?? ""}`;
    } else if (firstTd) {
        summary = firstTd.transitLine?.name ?? "";
    }

    return {
        id: `route-${index}`,
        duration,
        lines,
        depart: fmtTime(firstTd?.departureTime),
        arrive: fmtTime(lastTd?.arrivalTime),
        summary,
        fastest: false,
        steps,
    };
}

function parseSteps(leg: google.maps.routes.RouteLeg): RouteStep[] {
    return leg.steps.map((step): RouteStep => {
        const path: LatLng[] = (step.path ?? []).map((p) => ({lat: p.lat, lng: p.lng}));
        const td = step.transitDetails;
        if (td != null) {
            const line = td.transitLine;
            return {
                type: "transit",
                line: {
                    code: line?.shortName ?? line?.name ?? "?",
                    bg: line?.color ?? "#888888",
                    fg: line?.textColor ?? "#ffffff",
                },
                lineName: line?.name ?? undefined,
                departStop: td.departureStop?.name ?? "?",
                arriveStop: td.arrivalStop?.name ?? "?",
                numStops: td.stopCount,
                departTime: fmtTime(td.departureTime),
                arriveTime: fmtTime(td.arrivalTime),
                duration: step.localizedValues?.staticDuration ?? fmtMillis(step.staticDurationMillis),
                path,
            };
        }
        return {
            type: "walk",
            instructions: step.instructions ?? "",
            distance: step.localizedValues?.distance ?? fmtMeters(step.distanceMeters),
            duration: step.localizedValues?.staticDuration ?? fmtMillis(step.staticDurationMillis),
            durationMs: step.staticDurationMillis ?? undefined,
            distanceMeters: step.distanceMeters ?? undefined,
            path,
        };
    });
}
