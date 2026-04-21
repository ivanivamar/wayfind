"use client";

import {useEffect, useRef, useState} from "react";
import {LayersIcon, LogoutIcon, SettingsIcon, UserIcon} from "@/components/icons";
import {useAuth} from "@/contexts/AuthContext";
import {signOut} from "@/lib/firebase/auth";
import {useRouter} from "next/navigation";

export function SidebarFooter() {
    const {user} = useAuth();
    const router = useRouter();

    const [accountOpen, setAccountOpen] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
        if (typeof window === "undefined") return "light";
        return (localStorage.getItem("wf-theme") as "light" | "dark" | "system") ?? "light";
    });
    const [mapStyle, setMapStyle] = useState<"standard" | "satellite" | "night">("standard");
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    return (
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

                   {/* <button type="button"
                        className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[13px] text-fg-1
                                   transition-colors duration-100 hover:bg-fg-1/[0.04]">
                        <span className="text-fg-2"><SettingsIcon size={14}/></span>
                        Account settings
                    </button>*/}

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
        </div>
    );
}
