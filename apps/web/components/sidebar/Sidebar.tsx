"use client";

import {useEffect, useRef, useState} from "react";
import {Wordmark} from "@/components/ui/Wordmark";
import {IconButton} from "@/components/ui/IconButton";
import {ChevronLeftIcon, ClockIcon, PinIcon} from "@/components/icons";
import {SearchField} from "./SearchField";
import {SuggestionList} from "./SuggestionList";
import {
    usePlacesAutocomplete,
    type PlaceDetails,
    type PlaceSuggestion,
} from "@/lib/hooks/usePlacesAutocomplete";
import type {LatLng} from "@/lib/hooks/useGeolocation";

export interface SidebarProps {
    /** User's current location, used to bias autocomplete results. */
    biasLocation: LatLng | null;
    /** Fired when the user picks a place from the dropdown. */
    onDestinationSelected: (place: PlaceDetails) => void;
    /** Controlled open state — parent owns it for responsive behavior. */
    open: boolean;
    onToggle: () => void;
}

// Mock data for the Recent / Nearby lists until we wire Firestore up.
const MOCK_RECENT = [
    {id: "r1", name: "Gare de Lyon", sub: "Station · Paris"},
    {id: "r2", name: "Musée d'Orsay", sub: "Museum · 7th arr."},
];

const MOCK_NEARBY = [
    {id: "n1", name: "République", sub: "Square · 11th arr.", dist: "0.6 km"},
    {id: "n2", name: "Oberkampf", sub: "Metro line 5/9", dist: "0.3 km"},
    {id: "n3", name: "Canal Saint-Martin", sub: "Neighborhood", dist: "0.9 km"},
];

export function Sidebar({
                            biasLocation,
                            onDestinationSelected,
                            open,
                            onToggle,
                        }: SidebarProps) {
    const [query, setQuery] = useState("");
    const [focused, setFocused] = useState(false);
    const [selecting, setSelecting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const {suggestions, loading, fetchPlaceDetails} = usePlacesAutocomplete({
        input: query,
        biasLocation,
    });

    const showDropdown = focused && query.trim().length >= 2;

    const handleSelect = async (s: PlaceSuggestion) => {
        setSelecting(true);
        const place = await fetchPlaceDetails(s);
        setSelecting(false);
        if (place) {
            setQuery(place.displayName);
            setFocused(false);
            inputRef.current?.blur();
            onDestinationSelected(place);
        }
    };

    const handleClear = () => {
        setQuery("");
        inputRef.current?.focus();
    };

    // Close the dropdown if the panel is collapsed.
    useEffect(() => {
        if (!open) setFocused(false);
    }, [open]);

    // Collapsed: show a small floating toggle tab on the left edge.
    if (!open) {
        return (
            <div
                className="pointer-events-auto absolute left-3 top-3 z-10 rounded-xl border border-border
                   bg-bg/95 p-1.5 shadow-card backdrop-blur-xl"
            >
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

    return (
        <aside
            className="pointer-events-auto absolute bottom-3 left-3 top-3 z-10 flex w-[312px]
                 flex-col overflow-hidden rounded-xl border border-border
                 bg-bg/95 shadow-card backdrop-blur-xl"
        >
            {/* Header */}
            <div className="flex-shrink-0 px-3.5 pt-3.5">
                {/* Wordmark + collapse */}
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

                {/* Origin pill */}
                <div
                    className="mb-1.5 flex h-[34px] items-center gap-2 rounded-md border border-[#E8DDD0]
                     bg-surface px-2.5"
                >
                    <div className="h-[7px] w-[7px] flex-shrink-0 rounded-full bg-primary"/>
                    <span className="flex-1 text-[13px] text-fg-2">Your location</span>
                </div>

                {/* Search + dropdown */}
                <div className="relative mb-2.5">
                    <SearchField
                        ref={inputRef}
                        value={query}
                        onChange={setQuery}
                        onFocus={() => setFocused(true)}
                        // Delay blur so onMouseDown on a suggestion fires first.
                        onBlur={() => setTimeout(() => setFocused(false), 150)}
                        onClear={handleClear}
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto py-1.5">
                <SectionHeader>Recent</SectionHeader>
                {MOCK_RECENT.map((r) => (
                    <ListItem
                        key={r.id}
                        icon={<ClockIcon size={13}/>}
                        iconBg="bg-primary/10"
                        iconColor="text-fg-3"
                        primary={r.name}
                        secondary={r.sub}
                    />
                ))}

                <div className="mx-3.5 my-1.5 h-px bg-[#E8DDD0]"/>

                <SectionHeader>Nearby</SectionHeader>
                {MOCK_NEARBY.map((n) => (
                    <ListItem
                        key={n.id}
                        icon={<PinIcon size={13}/>}
                        iconBg="bg-primary/10"
                        iconColor="text-primary"
                        primary={n.name}
                        secondary={n.sub}
                        trailing={n.dist}
                    />
                ))}
            </div>
        </aside>
    );
}

function SectionHeader({children}: { children: React.ReactNode }) {
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
    trailing?: string;
    onClick?: () => void;
}

function ListItem({
                      icon,
                      iconBg,
                      iconColor,
                      primary,
                      secondary,
                      trailing,
                      onClick,
                  }: ListItemProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left transition-colors
                 duration-100 hover:bg-surface"
        >
            <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                    ${iconBg} ${iconColor}`}
            >
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-medium text-fg-1">{primary}</div>
                {secondary && (
                    <div className="truncate text-[11px] text-fg-3">{secondary}</div>
                )}
            </div>
            {trailing && (
                <div className="flex-shrink-0 text-[11px] text-[#C4AC94]">{trailing}</div>
            )}
        </button>
    );
}
