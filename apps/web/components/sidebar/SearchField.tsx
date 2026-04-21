"use client";

import {forwardRef, type ChangeEvent, type FocusEvent} from "react";
import {IconButton} from "@/components/ui/IconButton";
import {SearchIcon, XIcon} from "@/components/icons";

export interface SearchFieldProps {
    value: string;
    onChange: (value: string) => void;
    onFocus?: (e: FocusEvent<HTMLInputElement>) => void;
    onBlur?: (e: FocusEvent<HTMLInputElement>) => void;
    onClear?: () => void;
    placeholder?: string;
    focused?: boolean;
}

/**
 * Search field for the sidebar. Generic enough to reuse — owns all its styling.
 * The `focused` prop is external because the parent sometimes needs to drive it
 * (e.g. to keep the autocomplete open while mousing over results).
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(
    function SearchField(
        {
            value,
            onChange,
            onFocus,
            onBlur,
            onClear,
            placeholder = "Find a place or route",
            focused,
        },
        ref,
    ) {
        const isFocused = focused ?? false;
        return (
            <div
                className={`flex h-[34px] items-center gap-2 rounded-md border px-2.5
          transition-[background-color,border-color,box-shadow] duration-150
          ${
                    isFocused
                        ? "border-primary bg-surface-elevated shadow-ring-primary"
                        : "border-surface-hover bg-surface"
                }`}
            >
                <SearchIcon
                    size={13}
                    className={isFocused ? "text-primary" : "text-fg-3"}
                />
                <input
                    ref={ref}
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    className="flex-1 bg-transparent text-[13px] text-fg-1 outline-none placeholder:text-fg-3"
                />
                {value && onClear && (
                    <IconButton
                        icon={<XIcon size={12}/>}
                        label="Clear search"
                        onClick={onClear}
                        size={20}
                    />
                )}
            </div>
        );
    },
);
