import type {RouteResult} from "@/lib/hooks/useRoutes";

interface RouteCardProps {
    route: RouteResult;
    isSelected: boolean;
    index: number;
    onClick: () => void;
}

export function RouteCard({route: r, isSelected, index, onClick}: RouteCardProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative w-full px-3.5 py-3 pl-5 text-left transition-colors duration-100
                ${index > 0 ? "border-t border-divider" : ""}
                ${isSelected ? "bg-primary/[0.06]" : "hover:bg-item-hover"}`}
        >
            {isSelected && (
                <span aria-hidden className="absolute left-0 top-0 h-full w-[3px] bg-primary"/>
            )}
            <div className="flex items-baseline justify-between">
                <span className={`text-[15px] font-semibold ${isSelected ? "text-primary" : "text-fg-1"}`}>
                    {r.duration}
                </span>
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
}
