export function SectionHeader({children}: {children: React.ReactNode}) {
    return (
        <div className="px-3.5 pb-[3px] pt-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-fg-3">
            {children}
        </div>
    );
}
