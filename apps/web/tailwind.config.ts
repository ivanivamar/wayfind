import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Surfaces
        bg:           "#FAF8F5",
        surface:      "#F2EBE0",
        border:       "#E0D4C4",
        "border-focus": "#C4611A",
        // Foreground scale (1 = highest contrast)
        fg: {
          1: "#1C1510",
          2: "#6B5744",
          3: "#A8947E",
        },
        // Brand
        primary: {
          DEFAULT: "#C4611A",
          hover:   "#A85016",
          disabled:"#C4AC94",
        },
        danger: "#C4341A",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        // Matches the login card's layered shadow
        card: "0 12px 40px rgba(28,21,16,0.14), 0 4px 8px rgba(28,21,16,0.06)",
        // Focus rings
        "ring-primary": "0 0 0 3px rgba(196,97,26,0.12)",
        "ring-danger":  "0 0 0 3px rgba(196,52,26,0.10)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        spin: {
          to: { transform: "rotate(360deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 320ms cubic-bezier(0.2,0,0,1) both",
        spin: "spin 0.7s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
