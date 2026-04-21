"use client";

import {useEffect, useRef, useState} from "react";
import {IconButton} from "@/components/ui/IconButton";
import {
    CalendarIcon,
    ChevronLeftIcon,
    ClockIcon,
    HomeIcon,
    LayersIcon,
    LogoutIcon,
    PinIcon,
    PlusIcon,
    SettingsIcon,
    StarIcon,
    SwapIcon,
    TransitIcon,
    TrashIcon,
    UserIcon,
    WalkIcon,
    WorkIcon,
    XIcon,
} from "@/components/icons";
import {useAuth} from "@/contexts/AuthContext";
import {signOut} from "@/lib/firebase/auth";
import {useRouter} from "next/navigation";
import {SearchField} from "./SearchField";
import {SuggestionList} from "./SuggestionList";
import {
    usePlacesAutocomplete,
    type PlaceDetails,
    type PlaceSuggestion,
} from "@/lib/hooks/usePlacesAutocomplete";
import {useRoutes, type RouteResult, type RouteStep} from "@/lib/hooks/useRoutes";
import {usePlaces, type SavedPlace} from "@/lib/hooks/usePlaces";
import type {LatLng} from "@/lib/hooks/useGeolocation";

export interface SidebarProps {
    biasLocation: LatLng | null;
    onDestinationSelected: (place: PlaceDetails) => void;
    onRoutesChange?: (routes: RouteResult[]) => void;
    onSelectedRouteChange?: (id: string | null) => void;
    onEndpointsChange?: (endpoints: {origin: LatLng | null; destination: LatLng | null}) => void;
    /** When this changes, the Sidebar plans a route to the given place. */
    pendingDestination?: {place: PlaceDetails; nonce: number} | null;
    open: boolean;
    onToggle: () => void;
}

type TravelMode = "walk" | "transit";
type TimeOption = "now" | "depart" | "arrive";

const TRAVEL_MODES: {id: TravelMode; label: string; icon: React.ReactNode}[] = [
    {id: "walk",    label: "Walk",    icon: <WalkIcon size={15}/>},
    {id: "transit", label: "Transit", icon: <TransitIcon size={15}/>},
];

const TIME_OPTIONS: {id: TimeOption; label: string}[] = [
    {id: "now",    label: "Leave now"},
    {id: "depart", label: "Depart at"},
    {id: "arrive", label: "Arrive by"},
];

function savedPlaceToDetails(p: SavedPlace): PlaceDetails {
    return {
        placeId: p.googlePlaceId,
        displayName: p.displayName,
        formattedAddress: p.formattedAddress,
        location: p.location,
    };
}

export function Sidebar({biasLocation, onDestinationSelected, onRoutesChange, onSelectedRouteChange, onEndpointsChange, pendingDestination, open, onToggle}: SidebarProps) {
    const {user} = useAuth();
    const router = useRouter();

    // Saved places
    const {home, work, favorites, setHome, setWork, addFavorite, removePlace, isFavorited} = usePlaces();

    // Search screen
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [selecting, setSelecting] = useState(false);
    // When set, selecting a place from the main search saves it as this slot
    // instead of planning a route to it.
    const [savingSlot, setSavingSlot] = useState<"home" | "work" | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Planning screen
    const [screen, setScreen] = useState<"search" | "planning" | "detail">("search");
    const [originQuery, setOriginQuery] = useState("");
    const [destQuery, setDestQuery] = useState("");
    const [activeField, setActiveField] = useState<"origin" | "dest" | null>(null);
    const [travelMode, setTravelMode] = useState<TravelMode>("walk");
    const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
    const [detailRoute, setDetailRoute] = useState<RouteResult | null>(null);
    // Resolved PlaceDetails for each endpoint — null until user picks from autocomplete
    const [originPlace, setOriginPlace] = useState<PlaceDetails | null>(null);
    const [destPlace, setDestPlace] = useState<PlaceDetails | null>(null);
    const [timeOption, setTimeOption] = useState<TimeOption>("now");
    const [tripDate, setTripDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [tripTime, setTripTime] = useState(() => {
        const d = new Date();
        return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
    });
    const originInputRef = useRef<HTMLInputElement>(null);
    const destInputRef = useRef<HTMLInputElement>(null);

    // Footer
    const [accountOpen, setAccountOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
        if (typeof window === "undefined") return "light";
        return (localStorage.getItem("wf-theme") as "light" | "dark" | "system") ?? "light";
    });
    const [mapStyle, setMapStyle] = useState<"standard" | "satellite" | "night">("standard");
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Autocomplete hooks (called unconditionally)
    const {suggestions, loading, fetchPlaceDetails} = usePlacesAutocomplete({
        input: query,
        biasLocation,
    });
    const {suggestions: originSugs, loading: originLoading, fetchPlaceDetails: fetchOriginDetails} =
        usePlacesAutocomplete({
            input: screen === "planning" && activeField === "origin" && originQuery.trim().length >= 2
                ? originQuery : "",
            biasLocation,
        });
    const {suggestions: destSugs, loading: destLoading, fetchPlaceDetails: fetchDestDetails} =
        usePlacesAutocomplete({
            input: screen === "planning" && activeField === "dest" && destQuery.trim().length >= 2
                ? destQuery : "",
            biasLocation,
        });

    // Routing: origin = selected place or current location fallback; dest = selected place
    const routeOrigin: LatLng | null =
        originPlace?.location ?? (originQuery === "" ? biasLocation : null);
    const routeDest: LatLng | null = destPlace?.location ?? null;

    const {routes: liveRoutes, loading: routesLoading} = useRoutes({
        origin: screen === "planning" ? routeOrigin : null,
        destination: screen === "planning" ? routeDest : null,
        travelMode,
        timeOption,
        date: tripDate,
        time: tripTime,
    });

    const showDropdown = focused && query.trim().length >= 2;

    // ── handlers ────────────────────────────────────────────────────────────

    const handleSelect = async (s: PlaceSuggestion) => {
        setSelecting(true);
        const place = await fetchPlaceDetails(s);
        setSelecting(false);
        if (!place) return;

        if (savingSlot) {
            const slot = savingSlot;
            setSavingSlot(null);
            setQuery("");
            setFocused(false);
            inputRef.current?.blur();
            try {
                if (slot === "home") await setHome(place);
                else await setWork(place);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error("Failed to save place", err);
            }
            return;
        }

        setQuery(place.displayName);
        setFocused(false);
        inputRef.current?.blur();
        setDestQuery(place.displayName);
        setDestPlace(place);
        setOriginQuery("");
        setOriginPlace(null);
        setSelectedRoute(null);
        setScreen("planning");
        onDestinationSelected(place);
    };

    const applyToField = (field: "origin" | "dest", place: PlaceDetails) => {
        if (field === "origin") {
            setOriginQuery(place.displayName);
            setOriginPlace(place);
        } else {
            setDestQuery(place.displayName);
            setDestPlace(place);
            onDestinationSelected(place);
        }
        setActiveField(null);
        setSelectedRoute(null);
    };

    const currentLocationPlace: PlaceDetails | null = biasLocation
        ? {
              placeId: "__current_location",
              displayName: "Your location",
              formattedAddress: "Current location",
              location: biasLocation,
          }
        : null;

    const planToPlace = (place: PlaceDetails) => {
        setQuery(place.displayName);
        setDestQuery(place.displayName);
        setDestPlace(place);
        setOriginQuery("");
        setOriginPlace(null);
        setSelectedRoute(null);
        setScreen("planning");
        onDestinationSelected(place);
    };

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    const handleBack = () => {
        setScreen("search");
        setActiveField(null);
        setSelectedRoute(null);
        setDetailRoute(null);
        setOriginPlace(null);
        setDestPlace(null);
    };

    const handleSwap = () => {
        const tmpQuery = originQuery;
        const tmpPlace = originPlace;
        setOriginQuery(destQuery);
        setOriginPlace(destPlace);
        setDestQuery(tmpQuery);
        setDestPlace(tmpPlace);
        setSelectedRoute(null);
    };

    const handleOriginSelect = async (s: PlaceSuggestion) => {
        const place = await fetchOriginDetails(s);
        if (place) {
            setOriginQuery(place.displayName);
            setOriginPlace(place);
            setActiveField(null);
            setSelectedRoute(null);
        }
    };

    const handlePlanningDestSelect = async (s: PlaceSuggestion) => {
        const place = await fetchDestDetails(s);
        if (place) {
            setDestQuery(place.displayName);
            setDestPlace(place);
            setActiveField(null);
            setSelectedRoute(null);
            onDestinationSelected(place);
        }
    };

    // ── effects ─────────────────────────────────────────────────────────────

    useEffect(() => {
        if (!open) {
            setFocused(false);
            setAccountOpen(false);
            setActiveField(null);
        }
    }, [open]);

    // React to external destination requests (e.g. user clicked "Set as destination" on a map popup)
    useEffect(() => {
        if (!pendingDestination) return;
        planToPlace(pendingDestination.place);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pendingDestination?.nonce]);

    useEffect(() => {
        if (!onRoutesChange) return;
        if (screen === "planning") onRoutesChange(liveRoutes);
        else if (screen === "detail" && detailRoute) onRoutesChange([detailRoute]);
        else onRoutesChange([]);
    }, [screen, liveRoutes, detailRoute, onRoutesChange]);

    // Auto-select first route when a new route list comes in
    useEffect(() => {
        if (screen !== "planning") return;
        if (liveRoutes.length === 0) {
            if (selectedRoute !== null) setSelectedRoute(null);
            return;
        }
        if (!selectedRoute || !liveRoutes.some((r) => r.id === selectedRoute)) {
            setSelectedRoute(liveRoutes[0].id);
        }
    }, [liveRoutes, screen, selectedRoute]);

    useEffect(() => {
        if (!onEndpointsChange) return;
        if (screen === "search") onEndpointsChange({origin: null, destination: null});
        else onEndpointsChange({origin: routeOrigin, destination: routeDest});
    }, [screen, routeOrigin, routeDest, onEndpointsChange]);

    useEffect(() => {
        if (!onSelectedRouteChange) return;
        if (screen === "planning") onSelectedRouteChange(selectedRoute);
        else if (screen === "detail" && detailRoute) onSelectedRouteChange(detailRoute.id);
        else onSelectedRouteChange(null);
    }, [screen, selectedRoute, detailRoute, onSelectedRouteChange]);

    useEffect(() => {
        localStorage.setItem("wf-theme", theme);
        const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", dark);
    }, [theme]);

    useEffect(() => {
        if (!accountOpen) return;
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setAccountOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [accountOpen]);

    // ── collapsed ───────────────────────────────────────────────────────────

    if (!open) {
        return (
            <div className="pointer-events-auto absolute left-3 top-3 z-10 rounded-xl border border-border
                   bg-bg p-1.5 shadow-card backdrop-blur-xl">
                <IconButton
                    icon={<ChevronLeftIcon size={16} className="rotate-180"/>}
                    label="Open sidebar"
                    onClick={onToggle}
                    size={34}
                    variant="subtle"
                />
            </div>
        );
    }

    const routeFocused = activeField !== null;

    return (
        <aside className="pointer-events-auto absolute bottom-3 left-3 top-3 z-10 flex w-[312px]
                 flex-col overflow-hidden rounded-xl border border-border
                 bg-bg shadow-card backdrop-blur-xl">

            {/* ── search screen ── */}
            {screen === "search" && (
                <>
                    <div className="flex-shrink-0 px-3.5 pt-3.5">
                        <div className="mb-3 flex items-center justify-between">
                            <span className="text-[17px] font-semibold leading-none tracking-[-0.02em] text-fg-1">
                                way<span className="text-primary">find</span>
                            </span>
                            <IconButton
                                icon={<ChevronLeftIcon size={14}/>}
                                label="Collapse sidebar"
                                onClick={onToggle}
                            />
                        </div>

                        {savingSlot && (
                            <div className="mb-2 flex items-center justify-between rounded-md border border-primary/30 bg-primary/[0.06] px-2.5 py-1.5 text-[12px] text-fg-1">
                                <span>Search a place to set as <strong className="text-primary">{savingSlot === "home" ? "Home" : "Work"}</strong></span>
                                <button
                                    type="button"
                                    onClick={() => setSavingSlot(null)}
                                    className="text-fg-3 transition-colors hover:text-fg-1"
                                >
                                    <XIcon size={12}/>
                                </button>
                            </div>
                        )}
                        <div className="relative mb-2.5">
                            <SearchField
                                ref={inputRef}
                                value={query}
                                onChange={setQuery}
                                onFocus={() => setFocused(true)}
                                onBlur={() => setTimeout(() => setFocused(false), 150)}
                                onClear={handleClear}
                                placeholder={savingSlot ? `Set ${savingSlot === "home" ? "Home" : "Work"} location` : undefined}
                                focused={focused}
                            />
                            {showDropdown && (
                                <SuggestionList
                                    suggestions={suggestions}
                                    loading={loading || selecting}
                                    query={query}
                                    onSelect={handleSelect}
                                />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto py-1.5">
                        <SectionHeader>Saved</SectionHeader>
                        <SavedSlotRow
                            label="Home"
                            icon={<HomeIcon size={13}/>}
                            place={home}
                            onClick={() => {
                                if (home) planToPlace(savedPlaceToDetails(home));
                                else {
                                    setSavingSlot("home");
                                    setTimeout(() => inputRef.current?.focus(), 0);
                                }
                            }}
                            onRemove={home ? () => removePlace(home.id) : undefined}
                        />
                        <SavedSlotRow
                            label="Work"
                            icon={<WorkIcon size={13}/>}
                            place={work}
                            onClick={() => {
                                if (work) planToPlace(savedPlaceToDetails(work));
                                else {
                                    setSavingSlot("work");
                                    setTimeout(() => inputRef.current?.focus(), 0);
                                }
                            }}
                            onRemove={work ? () => removePlace(work.id) : undefined}
                        />

                        {favorites.length > 0 && (
                            <>
                                <SectionHeader>Favorites</SectionHeader>
                                {favorites.map((f) => (
                                    <FavoriteRow
                                        key={f.id}
                                        place={f}
                                        onClick={() => planToPlace(savedPlaceToDetails(f))}
                                        onRemove={() => removePlace(f.id)}
                                    />
                                ))}
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ── planning screen ── */}
            {screen === "planning" && (
                <>
                    <div className="flex-shrink-0 px-3.5 pt-3.5">
                        {/* Header */}
                        <div className="mb-3 flex items-center gap-1.5">
                            <IconButton
                                icon={<ChevronLeftIcon size={14}/>}
                                label="Back to search"
                                onClick={handleBack}
                            />
                            <span className="flex-1 text-[14px] font-semibold text-fg-1">Plan route</span>
                            {destPlace && (
                                <IconButton
                                    icon={
                                        <StarIcon
                                            size={14}
                                            filled={isFavorited(destPlace.placeId)}
                                            className={isFavorited(destPlace.placeId) ? "text-primary" : ""}
                                        />
                                    }
                                    label={isFavorited(destPlace.placeId) ? "Remove from favorites" : "Save as favorite"}
                                    onClick={() => {
                                        const fav = favorites.find((f) => f.googlePlaceId === destPlace.placeId);
                                        if (fav) removePlace(fav.id);
                                        else addFavorite(destPlace);
                                    }}
                                />
                            )}
                            <IconButton
                                icon={<ChevronLeftIcon size={14}/>}
                                label="Collapse sidebar"
                                onClick={onToggle}
                            />
                        </div>

                        {/* Route fields */}
                        <div className="relative mb-3">
                            <div className={`overflow-hidden rounded-lg border
                                transition-[border-color,box-shadow] duration-150
                                ${routeFocused ? "border-primary shadow-ring-primary" : "border-border"}`}>

                                <div className="flex h-[38px] items-center gap-2.5 bg-surface-elevated px-3 pr-9">
                                    <div className="h-2 w-2 flex-shrink-0 rounded-full border-[1.75px] border-fg-3"/>
                                    <input
                                        ref={originInputRef}
                                        value={originQuery}
                                        onChange={(e) => { setOriginQuery(e.target.value); setOriginPlace(null); }}
                                        onFocus={() => setActiveField("origin")}
                                        onBlur={() => setTimeout(() => setActiveField((f) => f === "origin" ? null : f), 150)}
                                        placeholder="Your location"
                                        className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
                                    />
                                    {originQuery && activeField === "origin" && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); setOriginQuery(""); originInputRef.current?.focus(); }}
                                            className="flex-shrink-0 text-fg-3 transition-colors hover:text-fg-1"
                                        >
                                            <XIcon size={12}/>
                                        </button>
                                    )}
                                </div>

                                <div className="mx-3 h-px bg-divider"/>

                                <div className="flex h-[38px] items-center gap-2.5 bg-surface-elevated px-3 pr-9">
                                    <PinIcon size={13} className="flex-shrink-0 text-primary"/>
                                    <input
                                        ref={destInputRef}
                                        value={destQuery}
                                        onChange={(e) => { setDestQuery(e.target.value); setDestPlace(null); }}
                                        onFocus={() => setActiveField("dest")}
                                        onBlur={() => setTimeout(() => setActiveField((f) => f === "dest" ? null : f), 150)}
                                        placeholder="Destination"
                                        className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
                                    />
                                    {destQuery && activeField === "dest" && (
                                        <button
                                            type="button"
                                            onMouseDown={(e) => { e.preventDefault(); setDestQuery(""); destInputRef.current?.focus(); }}
                                            className="flex-shrink-0 text-fg-3 transition-colors hover:text-fg-1"
                                        >
                                            <XIcon size={12}/>
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Swap button */}
                            <button
                                type="button"
                                onClick={handleSwap}
                                aria-label="Swap origin and destination"
                                className="absolute right-2.5 top-[38px] z-10 -translate-y-1/2
                                           flex h-[22px] w-[22px] items-center justify-center rounded
                                           border border-border bg-surface-elevated text-fg-3 shadow-sm
                                           transition-colors duration-100 hover:text-fg-1"
                            >
                                <SwapIcon size={11}/>
                            </button>

                            {/* Autocomplete dropdowns */}
                            {activeField === "origin" && originQuery.trim().length >= 2 && (
                                <SuggestionList
                                    suggestions={originSugs}
                                    loading={originLoading}
                                    query={originQuery}
                                    onSelect={handleOriginSelect}
                                />
                            )}
                            {activeField === "dest" && destQuery.trim().length >= 2 && (
                                <SuggestionList
                                    suggestions={destSugs}
                                    loading={destLoading}
                                    query={destQuery}
                                    onSelect={handlePlanningDestSelect}
                                />
                            )}
                            {activeField && (
                                (activeField === "origin" ? originQuery : destQuery).trim().length < 2
                            ) && (
                                <QuickPicks
                                    currentLocation={currentLocationPlace}
                                    home={home}
                                    work={work}
                                    onPick={(place) => applyToField(activeField, place)}
                                />
                            )}
                        </div>

                        {/* Travel mode */}
                        <div className="mb-3 flex gap-1.5">
                            {TRAVEL_MODES.map(({id, label, icon}) => (
                                <button
                                    key={id}
                                    type="button"
                                    onClick={() => { setTravelMode(id); setSelectedRoute(null); }}
                                    className={`flex flex-1 flex-col items-center gap-[3px] rounded-lg border
                                        py-2 text-[11px] font-medium transition-all duration-100
                                        ${travelMode === id
                                            ? "border-primary bg-primary/[0.08] text-primary"
                                            : "border-surface-hover text-fg-3 hover:border-border hover:text-fg-2"}`}
                                >
                                    {icon}
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="border-t border-divider px-3.5 py-3">
                            <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
                                When
                            </div>

                            <div className="flex gap-1">
                                {TIME_OPTIONS.map(({id, label}) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setTimeOption(id)}
                                        className={`flex-1 rounded-md border py-1.5 text-[12px] font-medium
                                            transition-all duration-100
                                            ${timeOption === id
                                                ? "border-primary bg-primary/[0.08] text-primary"
                                                : "border-surface-hover text-fg-3 hover:border-border"}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>

                            {timeOption !== "now" && (
                                <div className="mt-2.5 flex gap-2">
                                    <label className="flex flex-1 cursor-pointer items-center gap-2 rounded-md
                                                      border border-border bg-surface px-2.5 py-1.5
                                                      focus-within:border-primary focus-within:shadow-ring-primary
                                                      transition-[border-color,box-shadow] duration-150">
                                        <CalendarIcon size={13} className="flex-shrink-0 text-fg-3"/>
                                        <input
                                            type="date"
                                            value={tripDate}
                                            onChange={(e) => setTripDate(e.target.value)}
                                            className="min-w-0 flex-1 bg-transparent text-[13px] text-fg-1 outline-none"
                                        />
                                    </label>
                                    <label className="flex w-[96px] flex-shrink-0 cursor-pointer items-center gap-1.5
                                                      rounded-md border border-border bg-surface px-2.5 py-1.5
                                                      focus-within:border-primary focus-within:shadow-ring-primary
                                                      transition-[border-color,box-shadow] duration-150">
                                        <ClockIcon size={13} className="flex-shrink-0 text-fg-3"/>
                                        <input
                                            type="time"
                                            value={tripTime}
                                            onChange={(e) => setTripTime(e.target.value)}
                                            className="min-w-0 flex-1 bg-transparent text-[13px] text-fg-1 outline-none"
                                        />
                                    </label>
                                </div>
                            )}
                        </div>

                        {/* Routes */}
                        <div className="border-t border-divider">
                            <div className="px-3.5 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
                                Routes
                            </div>

                            {routesLoading && (
                                <div className="px-3.5 py-3 text-[13px] text-fg-3">Searching…</div>
                            )}

                            {!routesLoading && liveRoutes.length === 0 && routeDest && (
                                <div className="px-3.5 py-3 text-[13px] text-fg-3">No routes found.</div>
                            )}

                            {liveRoutes.map((r, i) => {
                                const isSelected = selectedRoute === r.id;
                                return (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => {
                                        if (isSelected) { setDetailRoute(r); setScreen("detail"); }
                                        else setSelectedRoute(r.id);
                                    }}
                                    className={`relative w-full px-3.5 py-3 pl-5 text-left transition-colors duration-100
                                        ${i > 0 ? "border-t border-divider" : ""}
                                        ${isSelected ? "bg-primary/[0.06]" : "hover:bg-item-hover"}`}
                                >
                                    {isSelected && (
                                        <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-primary"/>
                                    )}
                                    <div className="flex items-baseline justify-between">
                                        <span className={`text-[15px] font-semibold ${isSelected ? "text-primary" : "text-fg-1"}`}>{r.duration}</span>
                                        <div className="flex items-center gap-1.5">
                                            {r.fastest && (
                                                <span className="rounded bg-primary/[0.10] px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                                                    Fastest
                                                </span>
                                            )}
                                            <span className="text-[12px] text-fg-3">{r.distance ?? r.arrive}</span>
                                        </div>
                                    </div>
                                    {r.lines && r.lines.length > 0 && (
                                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                            {r.lines.map((line, li) => (
                                                <span
                                                    key={`${line.code}-${li}`}
                                                    style={{backgroundColor: line.bg, color: line.fg}}
                                                    className="rounded px-1.5 py-[2px] text-[11px] font-bold leading-none"
                                                >
                                                    {line.code}
                                                </span>
                                            ))}
                                            {r.summary && (
                                                <span className="text-[12px] text-fg-3">{r.summary}</span>
                                            )}
                                        </div>
                                    )}
                                    {!r.lines && r.summary && (
                                        <div className="mt-0.5 text-[12px] text-fg-3">{r.summary}</div>
                                    )}
                                    {r.depart && (
                                        <div className="mt-1 text-[11px] text-fg-3">Departs {r.depart}</div>
                                    )}
                                </button>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* ── detail screen ── */}
            {screen === "detail" && detailRoute && (() => {
                const route = detailRoute;
                return (
                    <>
                        <div className="flex-shrink-0 px-3.5 pt-3.5">
                            <div className="mb-3 flex items-center gap-1.5">
                                <IconButton
                                    icon={<ChevronLeftIcon size={14}/>}
                                    label="Back to routes"
                                    onClick={() => { setScreen("planning"); setDetailRoute(null); }}
                                />
                                <div className="flex min-w-0 flex-1 items-baseline gap-2">
                                    <span className="text-[17px] font-semibold text-fg-1">{route.duration}</span>
                                    {route.distance && (
                                        <span className="text-[13px] text-fg-3">{route.distance}</span>
                                    )}
                                    {route.lines && route.lines.length > 0 && (
                                        <div className="flex items-center gap-1">
                                            {route.lines.map((l, i) => (
                                                <span
                                                    key={i}
                                                    style={{backgroundColor: l.bg, color: l.fg}}
                                                    className="rounded px-1.5 py-[2px] text-[11px] font-bold leading-none"
                                                >
                                                    {l.code}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <IconButton
                                    icon={<ChevronLeftIcon size={14}/>}
                                    label="Collapse sidebar"
                                    onClick={onToggle}
                                />
                            </div>
                            {(route.depart || route.arrive) && (
                                <div className="mb-3 flex items-center gap-1.5 text-[12px] text-fg-3">
                                    {route.depart && <span>Departs {route.depart}</span>}
                                    {route.depart && route.arrive && <span>·</span>}
                                    {route.arrive && <span>Arrives {route.arrive}</span>}
                                </div>
                            )}
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {groupSteps(route.steps ?? []).map((group, i, arr) => {
                                const isLast = i === arr.length - 1;
                                if (group.type === "transit") {
                                    return <RouteStepRow key={i} step={group.step} isLast={isLast}/>;
                                }
                                return <WalkGroupRow key={i} steps={group.steps} isLast={isLast}/>;
                            })}
                        </div>
                    </>
                );
            })()}

            {/* ── footer (all screens) ── */}
            <div ref={dropdownRef} className="relative flex flex-shrink-0 items-center gap-2 border-t border-border px-3 py-2.5">

                {accountOpen && (
                    <div className="animate-drop-up absolute bottom-[calc(100%+6px)] left-3 right-3 overflow-hidden
                                    rounded-lg border border-surface-hover bg-surface-elevated shadow-dropdown">
                        <div className="border-b border-divider px-3.5 py-3">
                            <div className="text-[13px] font-semibold text-fg-1">
                                {user?.displayName ?? "Account"}
                            </div>
                            <div className="mt-0.5 text-[11px] text-fg-3">{user?.email}</div>
                        </div>

                        <button type="button"
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-fg-1
                                       transition-colors duration-100 hover:bg-fg-1/[0.04]">
                            <span className="text-fg-2"><SettingsIcon size={14}/></span>
                            Account settings
                        </button>

                        <div className="mx-0 h-px bg-divider"/>

                        <div className="px-3.5 pb-2.5 pt-2">
                            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
                                Theme
                            </div>
                            <div className="flex gap-1">
                                {(["light", "dark", "system"] as const).map((t) => (
                                    <button key={t} type="button" onClick={() => setTheme(t)}
                                        className={`flex-1 rounded-md border py-1 text-[12px] font-medium
                                                    transition-all duration-100
                                                    ${theme === t
                                                        ? "border-primary bg-primary/[0.08] text-primary"
                                                        : "border-surface-hover text-fg-3 hover:border-border"}`}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-divider"/>

                        <div className="px-3.5 pb-2.5 pt-2">
                            <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
                                Map style
                            </div>
                            <div className="flex gap-1">
                                {(["standard", "satellite", "night"] as const).map((s) => (
                                    <button key={s} type="button" onClick={() => setMapStyle(s)}
                                        className={`flex-1 rounded-md border py-1 text-[12px] font-medium
                                                    transition-all duration-100
                                                    ${mapStyle === s
                                                        ? "border-primary bg-primary/[0.08] text-primary"
                                                        : "border-surface-hover text-fg-3 hover:border-border"}`}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-divider"/>

                        <button type="button"
                            onClick={async () => { await signOut(); router.push("/login"); }}
                            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-danger
                                       transition-colors duration-100 hover:bg-danger/[0.06]">
                            <LogoutIcon size={14}/>
                            Sign out
                        </button>
                    </div>
                )}

                <button
                    type="button"
                    aria-label="Account"
                    aria-expanded={accountOpen}
                    onClick={() => setAccountOpen((o) => !o)}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left
                                transition-colors duration-150
                                ${accountOpen ? "bg-surface" : "hover:bg-surface"}`}
                >
                    <div className="h-[30px] w-[30px] flex-shrink-0 overflow-hidden rounded-full
                                    border border-surface-hover bg-surface-elevated text-fg-2">
                        {user?.photoURL
                            ? <img src={user.photoURL} alt="" className="h-full w-full object-cover"/>
                            : <div className="flex h-full w-full items-center justify-center">
                                <UserIcon size={14}/>
                              </div>
                        }
                    </div>
                    <span className="truncate text-[12px] font-medium text-fg-1">
                        {user?.displayName ?? user?.email ?? "Account"}
                    </span>
                </button>

                <button
                    type="button"
                    aria-label="Map layers"
                    className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                               border border-surface-hover bg-surface text-fg-2 transition-colors duration-150
                               hover:bg-surface-hover"
                >
                    <LayersIcon size={13}/>
                </button>
            </div>
        </aside>
    );
}

function SectionHeader({children}: {children: React.ReactNode}) {
    return (
        <div className="px-3.5 pb-[3px] pt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
            {children}
        </div>
    );
}

interface ListItemProps {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    primary: string;
    secondary?: string;
    onClick?: () => void;
}

function ListItem({icon, iconBg, iconColor, primary, secondary, onClick}: ListItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors
                 duration-100 hover:bg-item-hover"
        >
            <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg-1">{primary}</div>
                {secondary && <div className="truncate text-[11px] text-fg-3">{secondary}</div>}
            </div>
        </button>
    );
}

function QuickPicks({
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

function SavedSlotRow({
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

function FavoriteRow({
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

type StepGroup =
    | {type: "transit"; step: Extract<RouteStep, {type: "transit"}>}
    | {type: "walk"; steps: Extract<RouteStep, {type: "walk"}>[]};

function groupSteps(steps: RouteStep[]): StepGroup[] {
    const groups: StepGroup[] = [];
    for (const step of steps) {
        if (step.type === "transit") {
            groups.push({type: "transit", step});
        } else {
            const last = groups[groups.length - 1];
            if (last && last.type === "walk") last.steps.push(step);
            else groups.push({type: "walk", steps: [step]});
        }
    }
    return groups;
}

function fmtTotalDuration(ms: number): string {
    const min = Math.round(ms / 60_000);
    if (min < 60) return `${min} min`;
    const h = Math.floor(min / 60);
    const m = min % 60;
    return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}

function fmtTotalDistance(m: number): string {
    if (m >= 1000) return `${(m / 1000).toFixed(1)} km`;
    return `${Math.round(m)} m`;
}

function RouteStepRow({step, isLast}: {step: Extract<RouteStep, {type: "transit"}>; isLast: boolean}) {
    const border = !isLast ? "border-b border-divider" : "";
    return (
        <div className={`flex gap-3 px-3.5 py-3 ${border}`}>
            <div className="mt-0.5 flex-shrink-0">
                <span
                    style={{backgroundColor: step.line.bg, color: step.line.fg}}
                    className="flex h-7 min-w-[28px] items-center justify-center rounded-md px-1.5 text-[11px] font-bold leading-none"
                >
                    {step.line.code}
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-fg-1">
                    {step.departStop}
                    <span className="mx-1 text-fg-3">→</span>
                    {step.arriveStop}
                </div>
                <div className="mt-0.5 text-[11px] text-fg-3">
                    {[
                        step.numStops > 0 ? `${step.numStops} stop${step.numStops !== 1 ? "s" : ""}` : null,
                        step.departTime ? `Departs ${step.departTime}` : null,
                        step.duration,
                    ].filter(Boolean).join(" · ")}
                </div>
                {step.lineName && (
                    <div className="mt-0.5 text-[11px] text-fg-3">{step.lineName}</div>
                )}
            </div>
        </div>
    );
}

function WalkGroupRow({
    steps,
    isLast,
}: {
    steps: Extract<RouteStep, {type: "walk"}>[];
    isLast: boolean;
}) {
    const [expanded, setExpanded] = useState(false);
    const border = !isLast ? "border-b border-divider" : "";

    const totalMs = steps.reduce((s, st) => s + (st.durationMs ?? 0), 0);
    const totalM = steps.reduce((s, st) => s + (st.distanceMeters ?? 0), 0);
    const summary = [
        totalMs > 0 ? fmtTotalDuration(totalMs) : null,
        totalM > 0 ? fmtTotalDistance(totalM) : null,
    ].filter(Boolean).join(" · ");

    return (
        <div className={border}>
            <button
                type="button"
                onClick={() => setExpanded((e) => !e)}
                className="flex w-full items-center gap-3 px-3.5 py-3 text-left transition-colors duration-100 hover:bg-item-hover"
            >
                <div className="mt-0.5 flex-shrink-0">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-surface text-fg-2">
                        <WalkIcon size={14}/>
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <div className="text-[13px] font-medium text-fg-1">Walk</div>
                    {summary && (
                        <div className="mt-0.5 text-[11px] text-fg-3">{summary}</div>
                    )}
                </div>
                <ChevronLeftIcon
                    size={13}
                    className={`flex-shrink-0 text-fg-3 transition-transform duration-150
                        ${expanded ? "rotate-90" : "rotate-180"}`}
                />
            </button>
            {expanded && (
                <ol className="pb-2 pl-[52px] pr-3.5">
                    {steps.map((s, i) => (
                        <li key={i} className="py-1.5 text-[12px] leading-relaxed text-fg-2">
                            <div>{s.instructions}</div>
                            {(s.duration || s.distance) && (
                                <div className="mt-0.5 text-[11px] text-fg-3">
                                    {[s.duration, s.distance].filter(Boolean).join(" · ")}
                                </div>
                            )}
                        </li>
                    ))}
                </ol>
            )}
        </div>
    );
}
