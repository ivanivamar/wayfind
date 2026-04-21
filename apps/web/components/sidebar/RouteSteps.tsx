"use client";

import {useState} from "react";
import type {RouteStep} from "@/lib/hooks/useRoutes";
import {WalkIcon, ChevronLeftIcon} from "@/components/icons";

export type StepGroup =
    | {type: "transit"; step: Extract<RouteStep, {type: "transit"}>}
    | {type: "walk"; steps: Extract<RouteStep, {type: "walk"}>[]};

export function groupSteps(steps: RouteStep[]): StepGroup[] {
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

export function RouteStepRow({step, isLast}: {step: Extract<RouteStep, {type: "transit"}>; isLast: boolean}) {
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

export function WalkGroupRow({
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
