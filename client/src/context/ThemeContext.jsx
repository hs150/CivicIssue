import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  {
    id: "dark",
    name: "Black & White",
    subtitle: "Pitch black command center with pure white contrast",
    mode: "dark",
    primaryColor: "#FFFFFF",
    accentColor: "#E4E4E7",
    bgColor: "#000000",
    cardColor: "#0A0A0A",
    swatches: ["#000000", "#0A0A0A", "#222222", "#FFFFFF"]
  },
  {
    id: "light",
    name: "White & Black",
    subtitle: "Pure white canvas with sharp black typography and borders",
    mode: "light",
    primaryColor: "#000000",
    accentColor: "#18181B",
    bgColor: "#FFFFFF",
    cardColor: "#FAFAFA",
    swatches: ["#FFFFFF", "#FAFAFA", "#E5E7EB", "#000000"]
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem("civic_theme");
      if (saved === "dark") return "dark";
      return "light";
    } catch {
      return "light";
    }
  });

  const activeThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    try {
      localStorage.setItem("civic_theme", theme);
    } catch {}

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    if (activeThemeConfig.mode === "dark" || theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, activeThemeConfig]);

  function setTheme(themeId) {
    const normalized = themeId === "dark" ? "dark" : "light";
    setThemeState(normalized);
  }

  function toggleMode() {
    setThemeState((prev) => (prev === "dark" ? "light" : "dark"));
  }

  const isDark = theme === "dark" || activeThemeConfig.mode === "dark";

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleMode,
        isDark,
        themes: THEMES,
        activeTheme: activeThemeConfig
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
