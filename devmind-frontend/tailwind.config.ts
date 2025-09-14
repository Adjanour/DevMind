import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
  content: ["./src/**/*.tsx"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
      colors: {
        background: "var(--color-background)",
        foreground: "var(--color-foreground)",
        card: "var(--color-card)",
        "card-foreground": "var(--color-cardForeground)",
        primary: "var(--color-primary)",
        "primary-foreground": "var(--color-primaryForeground)",
        secondary: "var(--color-secondary)",
        "secondary-foreground": "var(--color-secondaryForeground)",
        muted: "var(--color-muted)",
        "muted-foreground": "var(--color-mutedForeground)",
        accent: "var(--color-accent)",
        "accent-foreground": "var(--color-accentForeground)",
        destructive: "var(--color-destructive)",
        "destructive-foreground": "var(--color-destructiveForeground)",
        border: "var(--color-border)",
        input: "var(--color-input)",
        ring: "var(--color-ring)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in": "slideIn 0.3s ease-out",
        "bounce-subtle": "bounceSubtle 2s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-2px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
