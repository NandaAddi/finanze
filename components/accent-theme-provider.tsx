"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type AccentTheme = "emerald" | "pink" | "blue" | "violet" | "orange";

interface ThemeContextValue {
  accent: AccentTheme;
  setAccent: (t: AccentTheme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  accent: "emerald",
  setAccent: () => {},
});

export function useAccentTheme() {
  return useContext(ThemeContext);
}

export function AccentThemeProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentTheme>("emerald");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("accent-theme") as AccentTheme | null;
    const validThemes: AccentTheme[] = ["emerald", "pink", "blue", "violet", "orange"];
    if (saved && validThemes.includes(saved)) {
      setAccentState(saved);
      applyTheme(saved);
    }
  }, []);

  const setAccent = (t: AccentTheme) => {
    setAccentState(t);
    localStorage.setItem("accent-theme", t);
    applyTheme(t);
  };

  return (
    <ThemeContext.Provider value={{ accent, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
}

function applyTheme(t: AccentTheme) {
  const html = document.documentElement;
  // Remove all theme classes
  html.classList.remove("theme-pink", "theme-blue", "theme-violet", "theme-orange");
  // Apply the selected theme (emerald is default)
  if (t !== "emerald") {
    html.classList.add(`theme-${t}`);
  }
}

