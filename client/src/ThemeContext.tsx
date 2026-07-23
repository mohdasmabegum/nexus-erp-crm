import { createContext, useContext, useState, ReactNode } from "react";

interface ThemeCtx { mode: "light" | "dark"; toggle: () => void; }
const ThemeCtx = createContext<ThemeCtx>({ mode: "light", toggle: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    (localStorage.getItem("theme") as "light" | "dark") ?? "light"
  );
  const toggle = () => {
    const next = mode === "light" ? "dark" : "light";
    localStorage.setItem("theme", next);
    setMode(next);
  };
  return <ThemeCtx.Provider value={{ mode, toggle }}>{children}</ThemeCtx.Provider>;
};

export const useThemeMode = () => useContext(ThemeCtx);
