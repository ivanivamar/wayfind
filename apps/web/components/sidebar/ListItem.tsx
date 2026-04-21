interface ListItemProps {
    icon: React.ReactNode;
    iconBg: string;
    iconColor: string;
    primary: string;
    secondary?: string;
    onClick?: () => void;
}

export function ListItem({icon, iconBg, iconColor, primary, secondary, onClick}: ListItemProps) {
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
