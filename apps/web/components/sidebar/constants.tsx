import {WalkIcon, TransitIcon} from "@/components/icons";

export type TravelMode = "walk" | "transit";
export type TimeOption = "now" | "depart" | "arrive";

export const TRAVEL_MODES: {id: TravelMode; label: string; icon: React.ReactNode}[] = [
    {id: "walk",    label: "Walk",    icon: <WalkIcon size={15}/>},
    {id: "transit", label: "Transit", icon: <TransitIcon size={15}/>},
];

export const TIME_OPTIONS: {id: TimeOption; label: string}[] = [
    {id: "now",    label: "Leave now"},
    {id: "depart", label: "Depart at"},
    {id: "arrive", label: "Arrive by"},
];
