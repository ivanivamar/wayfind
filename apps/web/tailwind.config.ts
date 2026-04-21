import type {Config} from "tailwindcss";

const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

const config: Config = {
    darkMode: "class",
    content: [
        "./app/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg:                 rgb("--color-bg"),
                surface:            rgb("--color-surface"),
                "surface-elevated": rgb("--color-surface-elevated"),
                "surface-hover":    rgb("--color-surface-hover"),
                "item-hover":       rgb("--color-item-hover"),
                divider:            rgb("--color-divider"),
                border:             rgb("--color-border"),
                "border-focus":     rgb("--color-primary"),
                fg: {
                    1: rgb("--color-fg-1"),
                    2: rgb("--color-fg-2"),
                    3: rgb("--color-fg-3"),
                },
                primary: {
                    DEFAULT:  rgb("--color-primary"),
                    hover:    rgb("--color-primary-hover"),
                    disabled: rgb("--color-primary-disabled"),
                },
                danger: rgb("--color-danger"),
            },
            fontFamily: {
                sans: ["Outfit", "system-ui", "sans-serif"],
                mono: ["JetBrains Mono", "ui-monospace", "monospace"],
            },
            boxShadow: {
                card:           "var(--shadow-card)",
                dropdown:       "var(--shadow-dropdown)",
                "ring-primary": "0 0 0 3px rgb(var(--color-primary) / 0.12)",
                "ring-danger":  "0 0 0 3px rgb(var(--color-danger) / 0.10)",
            },
            keyframes: {
                "fade-up": {
                    from: {opacity: "0", transform: "translateY(10px)"},
                    to:   {opacity: "1", transform: "translateY(0)"},
                },
                "drop-up": {
                    from: {opacity: "0", transform: "translateY(8px)"},
                    to:   {opacity: "1", transform: "translateY(0)"},
                },
                spin: {to: {transform: "rotate(360deg)"}},
            },
            animation: {
                "fade-up": "fade-up 320ms cubic-bezier(0.2,0,0,1) both",
                "drop-up": "drop-up 200ms cubic-bezier(0.2,0,0,1) both",
                spin:      "spin 0.7s linear infinite",
            },
        },
    },
    plugins: [],
};

export default config;
