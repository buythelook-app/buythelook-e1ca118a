import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        fashion: {
          primary: "hsl(var(--fashion-primary))",
          accent: "hsl(var(--fashion-accent))",
          "neutral-dark": "hsl(var(--fashion-neutral-dark))",
          "neutral-mid": "hsl(var(--fashion-neutral-mid))",
          "neutral-light": "hsl(var(--fashion-neutral-light))",
          glass: "hsl(var(--fashion-glass))",
          glow: "hsl(var(--fashion-glow))",
        },
        netflix: {
          background: "#0A0F1C",
          card: "#141B2D",
          text: "#F5F5F1",
          accent: "#8B5CF6",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Playfair Display", "serif"],
      },
      keyframes: {
        "card-hover": {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.05)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "card-hover": "card-hover 0.2s ease-in-out forwards",
        "fade-in": "fade-in 1s ease-in-out forwards",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/line-clamp"),
  ],
} satisfies Config;
