import { createContext, useContext } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

export const themes = {
  light: {
    name: "Light",
    colors: {
      background: "rgb(249, 250, 251)",
      foreground: "rgb(17, 24, 39)",
      card: "rgb(255, 255, 255)",
      cardForeground: "rgb(17, 24, 39)",
      primary: "rgb(59, 130, 246)",
      primaryForeground: "rgb(255, 255, 255)",
      secondary: "rgb(243, 244, 246)",
      secondaryForeground: "rgb(17, 24, 39)",
      muted: "rgb(243, 244, 246)",
      mutedForeground: "rgb(107, 114, 128)",
      accent: "rgb(243, 244, 246)",
      accentForeground: "rgb(17, 24, 39)",
      destructive: "rgb(239, 68, 68)",
      destructiveForeground: "rgb(255, 255, 255)",
      border: "rgb(229, 231, 235)",
      input: "rgb(229, 231, 235)",
      ring: "rgb(59, 130, 246)",
    },
  },
  dark: {
    name: "Dark",
    colors: {
      background: "rgb(3, 7, 18)",
      foreground: "rgb(248, 250, 252)",
      card: "rgb(15, 23, 42)",
      cardForeground: "rgb(248, 250, 252)",
      primary: "rgb(59, 130, 246)",
      primaryForeground: "rgb(15, 23, 42)",
      secondary: "rgb(30, 41, 59)",
      secondaryForeground: "rgb(248, 250, 252)",
      muted: "rgb(30, 41, 59)",
      mutedForeground: "rgb(148, 163, 184)",
      accent: "rgb(30, 41, 59)",
      accentForeground: "rgb(248, 250, 252)",
      destructive: "rgb(239, 68, 68)",
      destructiveForeground: "rgb(248, 250, 252)",
      border: "rgb(30, 41, 59)",
      input: "rgb(30, 41, 59)",
      ring: "rgb(59, 130, 246)",
    },
  },
};

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  const colors = themes[theme].colors;

  Object.entries(colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });

  // Update class for Tailwind dark mode
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}