import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({
  size = 16,
  strokeWidth = 2,
  children,
  ...rest
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 21l-4.35-4.35" />
      <path d="M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </Svg>
  );
}

export function PinIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
      <path d="M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
    </Svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2" />
      <path d="M12 6v6l4 2" />
    </Svg>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M15 18l-6-6 6-6" />
    </Svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18" />
      <path d="M3 12h18" />
      <path d="M3 18h18" />
    </Svg>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </Svg>
  );
}

export function LogoutIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </Svg>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </Svg>
  );
}

export function LayersIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 2 2 7l10 5 10-5-10-5" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </Svg>
  );
}

export function WalkIcon(props: IconProps) {
  return (
    <Svg {...props} strokeWidth={1.75}>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M10 8.5L12 6.5l2 2-1.5 4 1.5 2v5h-2l-.5-4.5L10 18v2H8l1.5-6-1-2L10 8.5z" />
      <path d="M8.5 9.5l-1.5 2M15.5 8l-1 2.5" />
    </Svg>
  );
}

export function BikeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="5.5" cy="16.5" r="3.5" />
      <circle cx="18.5" cy="16.5" r="3.5" />
      <path d="M15 7h-3l-1 3 1.5 2L8 13l1.5-5.5" />
      <path d="M5.5 16.5L9.5 13l5.5.5 3.5-6" />
      <path d="M12 4h3" />
    </Svg>
  );
}

export function TransitIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="13" rx="2" />
      <path d="M4 10h16" />
      <path d="M8 4v6M16 4v6" />
      <path d="M8 20l-1-3h10l-1 3" />
      <path d="M7 20h10" />
    </Svg>
  );
}

export function CarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 17H4a1 1 0 0 1-1-1v-4l2.5-5h13L21 12v4a1 1 0 0 1-1 1h-2" />
      <circle cx="7.5" cy="17" r="2.5" />
      <circle cx="16.5" cy="17" r="2.5" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function SwapIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M7 4v16M7 4 4 7M7 4l3 3" />
      <path d="M17 20V4m0 16 3-3m-3 3-3-3" />
    </Svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2V10z" />
    </Svg>
  );
}

export function WorkIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="7" width="18" height="13" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Svg>
  );
}

export function StarIcon(props: IconProps & { filled?: boolean }) {
  const { filled, ...rest } = props;
  return (
    <Svg {...rest} fill={filled ? "currentColor" : "none"}>
      <path d="M12 2l3.1 6.3 7 1-5 4.9 1.2 6.9L12 17.8 5.7 21.1 7 14.2l-5-4.9 7-1L12 2z" />
    </Svg>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Svg>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    </Svg>
  );
}

export function CalendarIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M3 10h18" />
      <path d="M8 2v4M16 2v4" />
    </Svg>
  );
}
