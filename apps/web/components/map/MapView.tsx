"use client";

import { Map } from "@vis.gl/react-google-maps";
import type { LatLng } from "@/lib/hooks/useGeolocation";

export interface MapViewProps {
    center: LatLng;
    zoom?: number;
    /**
     * Optional Cloud-based Map ID. Required if you want to use custom styling
     * configured in Google Cloud Console, or Advanced Markers.
     */
    mapId?: string;
}

/**
 * Renders a Google Map. Must be rendered inside an <APIProvider>, which on this
 * app lives in app/home/page.tsx so that sibling components like <Sidebar>
 * can also call useMapsLibrary() through the same context.
 *
 * Fills its parent element. Parent must establish a concrete size.
 */
export function MapView({ center, zoom = 13, mapId }: MapViewProps) {
    return (
        <Map
            defaultCenter={center}
            defaultZoom={zoom}
            mapId={mapId}
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: "100%", height: "100%" }}
        />
    );
}
