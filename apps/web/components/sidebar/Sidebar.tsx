"use client";

import {useEffect, useRef, useState} from "react";
import {IconButton} from "@/components/ui/IconButton";
import {
    CalendarIcon,
    ChevronLeftIcon,
    ClockIcon,
    HomeIcon,
    PinIcon,
    StarIcon,
    SwapIcon,
    WorkIcon,
    XIcon,
} from "@/components/icons";
import {SearchField} from "./SearchField";
import {SuggestionList} from "./SuggestionList";
import {
    usePlacesAutocomplete,
    type PlaceDetails,
    type PlaceSuggestion,
} from "@/lib/hooks/usePlacesAutocomplete";
import {useRoutes, type RouteResult} from "@/lib/hooks/useRoutes";
import {usePlaces} from "@/lib/hooks/usePlaces";
import type {LatLng} from "@/lib/hooks/useGeolocation";
import {type TravelMode, type TimeOption, TRAVEL_MODES, TIME_OPTIONS} from "./constants";
import {savedPlaceToDetails} from "./utils";
import {SectionHeader} from "./SectionHeader";
import {QuickPicks} from "./QuickPicks";
import {SavedSlotRow} from "./SavedSlotRow";
import {FavoriteRow} from "./FavoriteRow";
import {groupSteps, RouteStepRow, WalkGroupRow} from "./RouteSteps";
import {RouteCard} from "./RouteCard";
import {SidebarFooter} from "./SidebarFooter";

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

export function Sidebar({biasLocation, onDestinationSelected, onRoutesChange, onSelectedRouteChange, onEndpointsChange, pendingDestination, open, onToggle}: SidebarProps) {
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

                            {liveRoutes.map((r, i) => (
                                <RouteCard
                                    key={r.id}
                                    route={r}
                                    isSelected={selectedRoute === r.id}
                                    index={i}
                                    onClick={() => {
                                        if (selectedRoute === r.id) { setDetailRoute(r); setScreen("detail"); }
                                        else setSelectedRoute(r.id);
                                    }}
                                />
                            ))}
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
            <SidebarFooter/>
        </aside>
    );
}
