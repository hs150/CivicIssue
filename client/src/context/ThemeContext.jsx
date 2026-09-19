import { createContext, useContext, useEffect, useState } from "react";

export const THEMES = [
  {
    id: "emerald",
    name: "Emerald Civic",
    subtitle: "Default clean municipal theme",
    mode: "light",
    primaryColor: "#059669",
    accentColor: "#10b981",
    bgColor: "#f5f7f4",
    cardColor: "#ffffff",
    swatches: ["#059669", "#10b981", "#f5f7f4", "#ffffff"]
  },
  {
    id: "midnight",
    name: "Cyber Midnight",
    subtitle: "Futuristic dark mode with neon cyan",
    mode: "dark",
    primaryColor: "#06b6d4",
    accentColor: "#38bdf8",
    bgColor: "#030712",
    cardColor: "#0b1329",
    swatches: ["#06b6d4", "#38bdf8", "#030712", "#0b1329"]
  },
  {
    id: "navy",
    name: "Royal Governance",
    subtitle: "Deep sapphire & executive authority",
    mode: "dark",
    primaryColor: "#3b82f6",
    accentColor: "#60a5fa",
    bgColor: "#070d1d",
    cardColor: "#0e1a38",
    swatches: ["#3b82f6", "#60a5fa", "#070d1d", "#0e1a38"]
  },
  {
    id: "amber",
    name: "Sunset Stone",
    subtitle: "Warm earthy tones & terracotta",
    mode: "light",
    primaryColor: "#d97706",
    accentColor: "#f59e0b",
    bgColor: "#fdfaf6",
    cardColor: "#ffffff",
    swatches: ["#d97706", "#f59e0b", "#fdfaf6", "#ffffff"]
  }
];

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      return localStorage.getItem("civic_theme") || "emerald";
    } catch {
      return "emerald";
    }
  });

  const activeThemeConfig = THEMES.find((t) => t.id === theme) || THEMES[0];

  useEffect(() => {
    try {
      localStorage.setItem("civic_theme", theme);
    } catch {}

    const root = document.documentElement;
    root.setAttribute("data-theme", theme);

    if (activeThemeConfig.mode === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme, activeThemeConfig]);

  function setTheme(themeId) {
    if (THEMES.some((t) => t.id === themeId)) {
      setThemeState(themeId);
    }
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES, activeTheme: activeThemeConfig }}>
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
