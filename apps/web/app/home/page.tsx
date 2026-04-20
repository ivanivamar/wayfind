"use client";

import {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {APIProvider} from "@vis.gl/react-google-maps";
import {Button} from "@/components/ui/Button";
import {MapView} from "@/components/map/MapView";
import {Sidebar} from "@/components/sidebar/Sidebar";
import {useAuth} from "@/contexts/AuthContext";
import {signOut} from "@/lib/firebase/auth";
import {useGeolocation, type LatLng} from "@/lib/hooks/useGeolocation";
import {useMediaQuery} from "@/lib/hooks/useMediaQuery";
import type {PlaceDetails} from "@/lib/hooks/usePlacesAutocomplete";

const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

// Fallback center if the user denies geolocation or the request fails.
const FALLBACK_CENTER: LatLng = {lat: 41.3874, lng: 2.1686}; // Barcelona

export default function HomePage() {
    const router = useRouter();
    const {user, loading} = useAuth();
    const geo = useGeolocation({fallback: FALLBACK_CENTER});

    // Auto-collapse below 768px. User toggles persist within the session.
    const isSmall = useMediaQuery("(max-width: 767px)");
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [userHasToggled, setUserHasToggled] = useState(false);

    useEffect(() => {
        if (!userHasToggled) setSidebarOpen(!isSmall);
    }, [isSmall, userHasToggled]);

    useEffect(() => {
        if (!loading && !user) router.replace("/login");
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-bg">
                <p className="text-sm text-fg-3">Loading…</p>
            </main>
        );
    }

    if (!API_KEY) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-bg p-6">
                <p className="text-center text-sm text-fg-2">
                    Missing <code className="font-mono text-fg-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>.
                    Add it to <code className="font-mono text-fg-1">.env.local</code> and restart the dev server.
                </p>
            </main>
        );
    }

    const center =
        geo.status === "ready"
            ? geo.coords
            : geo.status === "error"
                ? geo.fallback
                : null;

    const biasLocation = geo.status === "ready" ? geo.coords : null;

    const handleToggleSidebar = () => {
        setUserHasToggled(true);
        setSidebarOpen((o) => !o);
    };

    const handleDestinationSelected = (place: PlaceDetails) => {
        // Hook for later — this is where we'll pan the map and render the route.
        // eslint-disable-next-line no-console
        console.log("Destination selected:", place);
    };

    const handleSignOut = async () => {
        await signOut();
        router.replace("/login");
    };

    return (
        // APIProvider wraps EVERYTHING that calls useMapsLibrary — map + sidebar.
        // If it only wraps the map, sidebar hooks see no context and return null.
        <APIProvider apiKey={API_KEY}>
            <main className="relative h-screen w-screen overflow-hidden bg-bg">
                {/* Map fills the viewport */}
                <div className="absolute inset-0">
                    {center ? (
                        <MapView center={center} zoom={14}/>
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <p className="text-sm text-fg-3">Locating you…</p>
                        </div>
                    )}
                </div>

                {/* Sidebar overlay */}
                <Sidebar
                    open={sidebarOpen}
                    onToggle={handleToggleSidebar}
                    biasLocation={biasLocation}
                    onDestinationSelected={handleDestinationSelected}
                />

                {/* Top-right identity + sign out — temporary scaffolding */}
                <div
                    className="absolute right-3 top-3 z-10 flex items-center gap-3 rounded-xl border
                     border-border bg-bg/95 px-4 py-2.5 shadow-card backdrop-blur-xl"
                >
                    <div className="text-right leading-tight">
                        <div className="text-[12px] font-medium text-fg-1">
                            {user.displayName || user.email}
                        </div>
                        {geo.status === "error" && (
                            <div className="text-[10px] text-fg-3">Using default location</div>
                        )}
                    </div>
                    <div className="w-[96px]">
                        <Button variant="secondary" onClick={handleSignOut}>
                            Sign out
                        </Button>
                    </div>
                </div>
            </main>
        </APIProvider>
    );
}
