"use client";

import {useCallback, useEffect, useState} from "react";
import {InfoWindow, Map, useMap, useMapsLibrary} from "@vis.gl/react-google-maps";
import type {MapMouseEvent} from "@vis.gl/react-google-maps";
import type {LatLng} from "@/lib/hooks/useGeolocation";
import type {RouteResult} from "@/lib/hooks/useRoutes";
import type {SavedPlace} from "@/lib/hooks/usePlaces";
import type {PlaceDetails} from "@/lib/hooks/usePlacesAutocomplete";

export interface MapViewProps {
    center: LatLng;
    zoom?: number;
    routes?: RouteResult[];
    selectedRouteId?: string | null;
    origin?: LatLng | null;
    destination?: LatLng | null;
    savedPlaces?: SavedPlace[];
    onSetDestination?: (place: PlaceDetails) => void;
    mapId?: string;
}

export function MapView({
    center,
    zoom = 13,
    routes,
    selectedRouteId,
    origin,
    destination,
    savedPlaces,
    onSetDestination,
    mapId,
}: MapViewProps) {
    const [popup, setPopup] = useState<PlaceDetails | null>(null);
    const placesLib = useMapsLibrary("places");

    const handleMapClick = useCallback(
        async (e: MapMouseEvent) => {
            const placeId = e.detail.placeId;
            if (!placeId || !placesLib) {
                setPopup(null);
                return;
            }
            e.stop();
            try {
                const place = new placesLib.Place({id: placeId});
                await place.fetchFields({fields: ["displayName", "formattedAddress", "location"]});
                const loc = place.location;
                if (!loc) return;
                setPopup({
                    placeId,
                    displayName: place.displayName ?? "Place",
                    formattedAddress: place.formattedAddress ?? "",
                    location: {lat: loc.lat(), lng: loc.lng()},
                });
            } catch (err) {
                // eslint-disable-next-line no-console
                console.warn("Failed to fetch place", err);
            }
        },
        [placesLib],
    );

    return (
        <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId={mapId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{width: "100%", height: "100%"}}
            onClick={handleMapClick}
        >
            <SavedPlaceMarkers places={savedPlaces ?? []} onPick={setPopup}/>
            <RoutePolylines routes={routes ?? []} selectedRouteId={selectedRouteId ?? null}/>
            <TransitStopMarkers routes={routes ?? []} selectedRouteId={selectedRouteId ?? null}/>
            <EndpointMarkers
                origin={origin ?? null}
                destination={destination ?? null}
                onPick={setPopup}
            />
            {popup && (
                <InfoWindow
                    position={popup.location}
                    onCloseClick={() => setPopup(null)}
                    pixelOffset={[0, -12]}
                >
                    <div className="min-w-[180px] max-w-[240px] py-0.5 font-sans">
                        <div className="text-[13px] font-semibold text-[#1C1510]">
                            {popup.displayName}
                        </div>
                        {popup.formattedAddress && (
                            <div className="mt-0.5 text-[11px] leading-snug text-[#6B5744]">
                                {popup.formattedAddress}
                            </div>
                        )}
                        {onSetDestination && (
                            <button
                                type="button"
                                onClick={() => {
                                    onSetDestination(popup);
                                    setPopup(null);
                                }}
                                className="mt-2 w-full rounded-md bg-[#C4611A] px-2.5 py-1.5 text-[12px]
                                           font-semibold text-white transition-colors hover:bg-[#A85016]"
                            >
                                Set as destination
                            </button>
                        )}
                    </div>
                </InfoWindow>
            )}
        </Map>
    );
}

// SVG glyph paths centered in a 24x24 viewBox, scaled to fit inside the circle.
const GLYPHS = {
    home:
        "<path d='M7 12l5-4 5 4v4.5a0.75 0.75 0 0 1-.75.75h-2.25v-3h-4v3H7.75a0.75 0.75 0 0 1-.75-.75z' fill='white'/>",
    work:
        "<rect x='7' y='10' width='10' height='7' rx='1' fill='white'/><path d='M10 10V9a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1' stroke='white' stroke-width='1.4' fill='none' stroke-linecap='round'/>",
    heart:
        "<path d='M12 17s-4.5-2.7-4.5-6a2.5 2.5 0 0 1 4.5-1.5A2.5 2.5 0 0 1 16.5 11c0 3.3-4.5 6-4.5 6z' fill='white'/>",
} as const;

function savedPlaceIcon(kind: "home" | "work" | "favorite"): google.maps.Icon {
    const glyph = kind === "home" ? GLYPHS.home : kind === "work" ? GLYPHS.work : GLYPHS.heart;
    const svg =
        `<svg xmlns='http://www.w3.org/2000/svg' width='26' height='26' viewBox='0 0 24 24'>` +
        `<circle cx='12' cy='12' r='10.5' fill='#C4611A' stroke='white' stroke-width='2'/>` +
        glyph +
        `</svg>`;
    return {
        url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
        scaledSize: new google.maps.Size(26, 26),
        anchor: new google.maps.Point(13, 13),
    };
}

function SavedPlaceMarkers({
    places,
    onPick,
}: {
    places: SavedPlace[];
    onPick: (place: PlaceDetails) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map || places.length === 0) return;
        const markers: google.maps.Marker[] = [];
        const listeners: google.maps.MapsEventListener[] = [];
        for (const p of places) {
            const marker = new google.maps.Marker({
                position: p.location,
                map,
                zIndex: 30,
                title: p.label ?? p.displayName,
                icon: savedPlaceIcon(p.kind),
            });
            listeners.push(marker.addListener("click", () => {
                onPick({
                    placeId: p.googlePlaceId,
                    displayName: p.label ?? p.displayName,
                    formattedAddress: p.formattedAddress,
                    location: p.location,
                });
            }));
            markers.push(marker);
        }
        return () => {
            for (const l of listeners) l.remove();
            for (const m of markers) m.setMap(null);
        };
    }, [map, places, onPick]);

    return null;
}

function TransitStopMarkers({
    routes,
    selectedRouteId,
}: {
    routes: RouteResult[];
    selectedRouteId: string | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        const markers: google.maps.Marker[] = [];

        for (const route of routes) {
            const isSelected = route.id === selectedRouteId;
            for (const step of route.steps) {
                if (step.type !== "transit" || step.path.length === 0) continue;
                const start = step.path[0];
                const end = step.path[step.path.length - 1];

                const icon: google.maps.Symbol = {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#ffffff",
                    fillOpacity: 1,
                    strokeColor: isSelected ? "#1f2937" : "#9ca3af",
                    strokeWeight: 2,
                    scale: 4.5,
                };

                markers.push(new google.maps.Marker({
                    position: start,
                    map,
                    zIndex: isSelected ? 50 : 20,
                    icon,
                }));
                markers.push(new google.maps.Marker({
                    position: end,
                    map,
                    zIndex: isSelected ? 50 : 20,
                    icon,
                }));
            }
        }

        return () => {
            for (const m of markers) m.setMap(null);
        };
    }, [map, routes, selectedRouteId]);

    return null;
}

function EndpointMarkers({
    origin,
    destination,
    onPick,
}: {
    origin: LatLng | null;
    destination: LatLng | null;
    onPick: (place: PlaceDetails) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;
        const markers: google.maps.Marker[] = [];
        const listeners: google.maps.MapsEventListener[] = [];

        if (origin) {
            const m = new google.maps.Marker({
                position: origin,
                map,
                zIndex: 100,
                title: "Origin",
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#ffffff",
                    fillOpacity: 1,
                    strokeColor: "#1f2937",
                    strokeWeight: 3,
                    scale: 7,
                },
            });
            listeners.push(m.addListener("click", () => {
                onPick({
                    placeId: "__origin",
                    displayName: "Origin",
                    formattedAddress: "",
                    location: origin,
                });
            }));
            markers.push(m);
        }

        if (destination) {
            const m = new google.maps.Marker({
                position: destination,
                map,
                zIndex: 101,
                title: "Destination",
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#C4611A",
                    fillOpacity: 1,
                    strokeColor: "#ffffff",
                    strokeWeight: 2.5,
                    scale: 7,
                },
            });
            listeners.push(m.addListener("click", () => {
                onPick({
                    placeId: "__destination",
                    displayName: "Destination",
                    formattedAddress: "",
                    location: destination,
                });
            }));
            markers.push(m);
        }

        return () => {
            for (const l of listeners) l.remove();
            for (const m of markers) m.setMap(null);
        };
    }, [map, origin?.lat, origin?.lng, destination?.lat, destination?.lng, onPick]);

    return null;
}

function RoutePolylines({
    routes,
    selectedRouteId,
}: {
    routes: RouteResult[];
    selectedRouteId: string | null;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map || routes.length === 0) return;

        const polylines: google.maps.Polyline[] = [];
        const bounds = new google.maps.LatLngBounds();

        const dotBorderSymbol = (selected: boolean): google.maps.Symbol => ({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: selected ? "#1f2937" : "#9ca3af",
            fillOpacity: 1,
            strokeOpacity: 0,
            scale: 5.5,
        });
        const dotSymbol = (selected: boolean): google.maps.Symbol => ({
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: selected ? "#4285F4" : "#cbd5e1",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 1,
            scale: 4,
        });

        const ordered = [...routes].sort((a, b) => {
            const aSel = a.id === selectedRouteId ? 1 : 0;
            const bSel = b.id === selectedRouteId ? 1 : 0;
            return aSel - bSel;
        });

        for (const route of ordered) {
            const isSelected = route.id === selectedRouteId;
            for (const step of route.steps) {
                if (step.path.length === 0) continue;

                const path = step.path.map((p) => ({lat: p.lat, lng: p.lng}));
                path.forEach((p) => bounds.extend(p));

                const isWalk = step.type === "walk";
                const zIndex = isSelected ? 10 : 1;

                if (isWalk) {
                    polylines.push(new google.maps.Polyline({
                        path,
                        map,
                        zIndex,
                        strokeOpacity: 0,
                        strokeWeight: 0,
                        icons: [{icon: dotBorderSymbol(isSelected), offset: "0", repeat: "14px"}],
                    }));
                    polylines.push(new google.maps.Polyline({
                        path,
                        map,
                        zIndex: zIndex + 1,
                        strokeOpacity: 0,
                        strokeWeight: 0,
                        icons: [{icon: dotSymbol(isSelected), offset: "0", repeat: "14px"}],
                    }));
                } else {
                    polylines.push(new google.maps.Polyline({
                        path,
                        map,
                        zIndex,
                        strokeColor: isSelected ? "#1f2937" : "#9ca3af",
                        strokeOpacity: isSelected ? 0.9 : 0.6,
                        strokeWeight: 8,
                    }));
                    polylines.push(new google.maps.Polyline({
                        path,
                        map,
                        zIndex: zIndex + 1,
                        strokeColor: isSelected ? step.line.bg : "#d1d5db",
                        strokeOpacity: isSelected ? 1 : 0.7,
                        strokeWeight: 5,
                    }));
                }
            }
        }

        if (!bounds.isEmpty()) {
            map.fitBounds(bounds, 80);
        }

        return () => {
            for (const p of polylines) p.setMap(null);
        };
    }, [map, routes, selectedRouteId]);

    return null;
}
