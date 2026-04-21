"use client";

import {PinIcon} from "@/components/icons";
import type {PlaceSuggestion} from "@/lib/hooks/usePlacesAutocomplete";

export interface SuggestionListProps {
    suggestions: PlaceSuggestion[];
    loading: boolean;
    query: string;
    onSelect: (s: PlaceSuggestion) => void;
}

/**
 * Dropdown shown below the search field. Absolutely positioned, rendered inside
 * the search-field's relative parent. Uses onMouseDown (not onClick) so the
 * click registers before the input's onBlur fires and hides the dropdown.
 */
export function SuggestionList(
    {
        suggestions,
        loading,
        query,
        onSelect,
    }: SuggestionListProps) {
    const showEmpty = !loading && suggestions.length === 0 && query.trim().length >= 2;

    return (
        <div
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-20 overflow-hidden rounded-lg
                 border border-surface-hover bg-surface-elevated
                 shadow-[0_8px_24px_rgba(28,21,16,0.14)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.4)]
                 animate-fade-up"
        >
            {loading && suggestions.length === 0 && (
                <div className="p-3.5 text-center text-[13px] text-fg-3">Searching…</div>
            )}
            {showEmpty && (
                <div className="p-3.5 text-center text-[13px] text-fg-3">
                    No results for &ldquo;{query}&rdquo;
                </div>
            )}
            {suggestions.map((s, i) => (
                <button
                    key={s.placeId}
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault(); // keep the input focused
                        onSelect(s);
                    }}
                    className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors
                      duration-100 hover:bg-item-hover
                      ${i > 0 ? "border-t border-divider" : ""}`}
                >
                    <div
                        className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md
                       bg-primary/10 text-primary"
                    >
                        <PinIcon size={13}/>
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="truncate text-[13px] font-medium text-fg-1">
                            {s.mainText}
                        </div>
                        {s.secondaryText && (
                            <div className="truncate text-[11px] text-fg-3">
                                {s.secondaryText}
                            </div>
                        )}
                    </div>
                </button>
            ))}
        </div>
    );
}
